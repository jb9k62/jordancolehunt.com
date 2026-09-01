/**
 * Build-time blog parser (port of the old NestJS BlogService).
 * Reads Markdown from content/blog, renders + sanitises at build time.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, normalize, relative } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  pinned?: boolean;
  draft?: boolean;
  content?: string;
  html?: string;
}

export const contentPath = join(process.cwd(), 'content', 'blog');

// Configure marked once with the custom renderer + sanitisation
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (error) {
      console.error(`Syntax highlighting error for language ${lang}:`, error);
    }
  }
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
};

marked.use({
  renderer,
  breaks: true,
  gfm: true,
  hooks: {
    postprocess: (html) =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'strong', 'em', 'code', 'pre',
          'ul', 'ol', 'li',
          'a', 'img',
          'blockquote',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
      }),
  },
});

/**
 * Validates that the resolved path is within the content directory.
 * Prevents path traversal attacks.
 */
export function validatePath(slug: string): string {
  const normalizedSlug = normalize(slug).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = join(contentPath, `${normalizedSlug}.md`);
  const relativePath = relative(contentPath, filePath);

  if (relativePath.startsWith('..') || !relativePath) {
    throw new Error('Invalid blog post path');
  }

  return filePath;
}

function parseMeta(filename: string): Omit<BlogPost, 'content' | 'html'> | null {
  try {
    const filePath = join(contentPath, filename);
    const fileContents = readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContents);

    if (!data.title || !data.date) {
      console.warn(`Skipping ${filename}: missing required frontmatter (title, date)`);
      return null;
    }

    return {
      slug: data.slug || filename.replace('.md', ''),
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || '',
      author: data.author || 'Jordan Cole Hunt',
      tags: Array.isArray(data.tags) ? data.tags : [],
      ...(data.pinned === true && { pinned: true }),
      ...(data.draft === true && { draft: true }),
    };
  } catch (error) {
    console.error(`Error reading blog post ${filename}:`, error);
    return null;
  }
}

/** Get all published posts, pinned first then by date (newest first). */
export function getAllPosts(): BlogPost[] {
  if (!existsSync(contentPath)) {
    console.warn(`Content directory does not exist: ${contentPath}`);
    return [];
  }

  const files = readdirSync(contentPath).filter((f) => f.endsWith('.md'));

  const posts = files
    .map(parseMeta)
    .filter((post): post is NonNullable<typeof post> => post !== null && post.draft !== true);

  const sorted = posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sorted;
}

/** Get a single published post with rendered + sanitised HTML. */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const filePath = validatePath(slug);

  if (!existsSync(filePath)) {
    throw new Error(`Blog post not found: ${slug}`);
  }

  const fileContents = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);

  if (!data.title || !data.date) {
    throw new Error('Invalid blog post format');
  }

  if (data.draft === true) {
    throw new Error(`Blog post not found: ${slug}`);
  }

  const html = await marked(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt || '',
    author: data.author || 'Jordan Cole Hunt',
    tags: Array.isArray(data.tags) ? data.tags : [],
    ...(data.pinned === true && { pinned: true }),
    content,
    html,
  };
}

/** All slugs actually present as published posts. */
export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const all = getAllPosts();
  const out: BlogPost[] = [];
  for (const post of all) {
    try {
      out.push(await getPostBySlug(post.slug));
    } catch (error) {
      console.error(`Skipping post ${post.slug}:`, (error as Error).message);
    }
  }
  return out;
}

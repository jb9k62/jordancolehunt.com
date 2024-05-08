import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);
  private readonly contentPath = join(process.cwd(), 'content', 'blog');

  constructor() {
    // Configure marked with custom renderer for syntax highlighting
    const renderer = new marked.Renderer();

    renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(text, { language: lang }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (error) {
          this.logger.error(`Syntax highlighting error for language ${lang}:`, error);
        }
      }
      const highlighted = hljs.highlightAuto(text).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    };

    // Configure marked with sanitization and custom renderer
    marked.use({
      renderer,
      breaks: true,
      gfm: true,
      hooks: {
        postprocess: (html) => {
          // Sanitize HTML to prevent XSS attacks
          return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'p', 'br', 'hr',
              'strong', 'em', 'code', 'pre',
              'ul', 'ol', 'li',
              'a', 'img',
              'blockquote',
              'table', 'thead', 'tbody', 'tr', 'th', 'td',
              'div', 'span'
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
            ALLOW_DATA_ATTR: false,
          });
        }
      }
    });

    this.logger.log('BlogService initialized with secure markdown parsing');
  }

  /**
   * Validates that the resolved path is within the content directory
   * Prevents path traversal attacks
   */
  private validatePath(slug: string): string {
    const normalizedSlug = normalize(slug).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = join(this.contentPath, `${normalizedSlug}.md`);
    const relativePath = relative(this.contentPath, filePath);

    // Ensure the file is within content/blog directory
    if (relativePath.startsWith('..') || !relativePath) {
      throw new NotFoundException('Invalid blog post path');
    }

    return filePath;
  }

  /**
   * Get all published blog posts (for blog index)
   * Returns posts sorted by date (newest first)
   */
  getAllPosts(): BlogPost[] {
    try {
      if (!existsSync(this.contentPath)) {
        this.logger.warn(`Content directory does not exist: ${this.contentPath}`);
        return [];
      }

      const files = readdirSync(this.contentPath).filter(f => f.endsWith('.md'));

      if (files.length === 0) {
        this.logger.log('No blog posts found');
        return [];
      }

      const posts = files
        .map(filename => {
          try {
            const filePath = join(this.contentPath, filename);
            const fileContents = readFileSync(filePath, 'utf-8');
            const { data } = matter(fileContents);

            // Validate required frontmatter fields
            if (!data.title || !data.date) {
              this.logger.warn(`Skipping ${filename}: missing required frontmatter (title, date)`);
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
              ...(data.draft === true && { draft: true })
            };
          } catch (error) {
            this.logger.error(`Error reading blog post ${filename}:`, error);
            return null;
          }
        })
        .filter(post => post !== null && post.draft !== true) as BlogPost[];

      // Sort: pinned posts first, then by date (newest first)
      const sortedPosts = posts.sort((a, b) => {
        // Pinned posts come first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Within same pin status, sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      const pinnedCount = posts.filter(p => p.pinned).length;
      this.logger.log(`Loaded ${sortedPosts.length} blog posts (${pinnedCount} pinned)`);
      return sortedPosts;
    } catch (error) {
      this.logger.error('Error loading blog posts:', error);
      return [];
    }
  }

  /**
   * Get a single blog post by slug
   * Returns post with rendered HTML content
   */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    try {
      // Validate and sanitize the path
      const filePath = this.validatePath(slug);

      if (!existsSync(filePath)) {
        throw new NotFoundException(`Blog post not found: ${slug}`);
      }

      const fileContents = readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContents);

      // Validate required frontmatter
      if (!data.title || !data.date) {
        this.logger.error(`Blog post ${slug} missing required frontmatter`);
        throw new NotFoundException('Invalid blog post format');
      }

      // Check if post is a draft
      if (data.draft === true) {
        this.logger.log(`Attempted access to draft post: ${slug}`);
        throw new NotFoundException(`Blog post not found: ${slug}`);
      }

      // Parse and sanitize markdown to HTML
      const html = await marked(content);

      const post: BlogPost = {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt || '',
        author: data.author || 'Jordan Cole Hunt',
        tags: Array.isArray(data.tags) ? data.tags : [],
        ...(data.pinned === true && { pinned: true }),
        content,
        html
      };

      this.logger.log(`Successfully loaded blog post: ${slug}`);
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error loading blog post ${slug}:`, error);
      throw new NotFoundException(`Blog post not found: ${slug}`);
    }
  }
}

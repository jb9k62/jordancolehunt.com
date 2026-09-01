/**
 * Static site build.
 * Renders all pages from Pug at build time, hashes css/js assets, copies
 * public/ verbatim, and emits sitemap.xml + robots.txt into dist-site/.
 */
import { createHash } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  statSync,
  copyFileSync,
  rmSync,
} from 'fs';
import { join, relative, sep } from 'path';
import pug from 'pug';
import { getAllPosts, getPostBySlug, contentPath } from './lib/blog';

const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const VIEWS = join(ROOT, 'views');
const OUT = join(ROOT, 'dist-site');

// ---- Build-time config (public values, baked into HTML) ----
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'jb9k62';
const HCAPTCHA_SITE_KEY = process.env.HCAPTCHA_SITE_KEY || '';
const BASE_URL = process.env.BASE_URL || 'https://jordancolehunt.com';
const CV_PATH = '/cv/resume-v2.pdf';
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;

// ---- Asset hashing ----
// Map of public URL -> file path (relative to public)
const HASHABLE = [
  '/styles/main.css',
  '/styles/components.css',
  '/styles/transitions.css',
  '/js/app.js',
  '/js/transitions.js',
  '/js/image-modal.js',
  '/script.js',
];

function md5(data: string): string {
  return createHash('md5').update(data).digest('hex').slice(0, 12);
}

function buildAssetMap(outDir: string): Record<string, string> {
  const map: Record<string, string> = {};
  const dirnameOf = (p: string): string => {
    const i = p.lastIndexOf('/');
    return i === -1 ? '' : p.slice(0, i);
  };
  const basenameOf = (p: string): string => {
    const i = p.lastIndexOf('/');
    return i === -1 ? p : p.slice(i + 1);
  };
  for (const url of HASHABLE) {
    const rel = url.replace(/^\//, '');
    const srcPath = join(PUBLIC, rel);
    if (!existsSync(srcPath)) {
      console.warn(`  ! MISSING asset: ${url}`);
      continue;
    }
    const content = readFileSync(srcPath, 'utf-8');
    const hash = md5(content);
    const base = basenameOf(rel);
    const dot = base.lastIndexOf('.');
    const stem = dot === -1 ? base : base.slice(0, dot);
    const ext = dot === -1 ? '' : base.slice(dot);
    // Root-level JS (public/script.js) is emitted under /js/ so Nginx serves it
    // immutable (its ^/js/.+\.js$ location). Other assets keep their directory.
    const dir = rel === 'script.js' ? 'js' : dirnameOf(rel);
    const hashedRel = [dir, `${stem}.${hash}${ext}`].filter(Boolean).join('/');
    const hashedUrl = `/${hashedRel}`;
    const hashedSrc = hashedRel.split(sep).join('/');
    const slashIdx = hashedSrc.lastIndexOf('/');
    if (slashIdx !== -1) {
      mkdirSync(join(outDir, hashedSrc.slice(0, slashIdx)), { recursive: true });
    }
    copyFileSync(srcPath, join(outDir, ...hashedSrc.split('/')));
    map[url] = hashedUrl;
    console.log(`  hashed ${url} -> ${hashedUrl}`);
  }
  return map;
}

function postProcess(html: string, assetMap: Record<string, string>): string {
  let out = html;
  for (const [orig, hashed] of Object.entries(assetMap)) {
    out = out.split(orig).join(hashed);
  }
  return out;
}

function render(view: string, locals: Record<string, unknown>): string {
  const fn = pug.compileFile(join(VIEWS, `${view}.pug`));
  return fn(locals);
}

function ensureDir(file: string): void {
  mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
}

function copyDir(src: string, dest: string, exclude: string[]): void {
  if (!existsSync(src)) return;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = join(src, entry.name);
    const relFromPublic = relative(PUBLIC, s);
    const url = `/${relFromPublic.split(sep).join('/')}`;
    if (exclude.includes(url)) continue;
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, exclude);
    } else {
      mkdirSync(d.slice(0, d.lastIndexOf(sep)), { recursive: true });
      copyFileSync(s, d);
    }
  }
}

function lastmod(path: string): string {
  try {
    return new Date(statSync(path).mtimeMs).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

async function build() {
  console.log('=== Static site build ===');
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`GITHUB: ${GITHUB_USERNAME}`);
  console.log(`HCAPTCHA_SITE_KEY: ${HCAPTCHA_SITE_KEY || '(unset)'}`);

  // Clean output
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // 1. Hash assets
  console.log('\n[Hashing assets]');
  const assetMap = buildAssetMap(OUT);

  // 1b. Fail loudly if the content submodule is missing
  if (!existsSync(contentPath)) {
    console.error(`\nFATAL: content directory not found: ${contentPath}`);
    console.error('The content submodule must be checked out (git submodule update --init) before building.');
    process.exitCode = 1;
    return;
  }

  // 1c. hCaptcha site key guard — the contact page depends on it
  if (!HCAPTCHA_SITE_KEY) {
    console.warn('\nWARNING: HCAPTCHA_SITE_KEY is empty. The hCaptcha widget on the contact page');
    console.warn('will not render and the contact form will be non-functional until it is set');
    console.warn('(via fly.toml [build].args or the HCAPTCHA_SITE_KEY env var).\n');
  }

  // 2. Parse blog
  console.log('\n[Parsing blog]');
  const posts = getAllPosts();
  console.log(`  ${posts.length} published post(s)`);
  const fullPosts = new Map<string, Awaited<ReturnType<typeof getPostBySlug>>>();
  for (const p of posts) {
    try {
      const post = await getPostBySlug(p.slug);
      fullPosts.set(p.slug, post);
      console.log(`  - ${p.slug}`);
    } catch (error) {
      console.error(`  ! Failed to build post ${p.slug}:`, (error as Error).message);
      process.exitCode = 1;
      continue;
    }
  }

  // 3. Render pages
  console.log('\n[Rendering pages]');
  const base = {
    githubUsername: GITHUB_USERNAME,
    githubUrl: GITHUB_URL,
    hcaptchaSiteKey: HCAPTCHA_SITE_KEY,
    cvPath: CV_PATH,
    baseUrl: BASE_URL,
  };

  const pages: { view: string; out: string; locals: Record<string, unknown> }[] = [
    { view: 'index', out: 'index.html', locals: { title: 'JCH - Software Engineer', page: 'home', currentPath: '/' } },
    { view: 'skills', out: 'skills/index.html', locals: { title: 'Skills - JCH', page: 'skills', currentPath: '/skills' } },
    { view: 'projects', out: 'projects/index.html', locals: { title: 'Projects - JCH', page: 'projects', currentPath: '/projects' } },
    { view: 'about', out: 'about/index.html', locals: { title: 'About - JCH', page: 'about', currentPath: '/about' } },
    { view: 'contact', out: 'contact/index.html', locals: { title: 'Contact - JCH', page: 'contact', currentPath: '/contact' } },
    { view: 'cv', out: 'cv/index.html', locals: { title: 'CV - JCH', page: 'cv', currentPath: '/cv' } },
    { view: 'blog', out: 'blog/index.html', locals: { title: 'Blog - JCH', page: 'blog', currentPath: '/blog', posts } },
    { view: '404', out: '404.html', locals: { title: '404 - Not Found', page: '404', currentPath: '/404' } },
  ];

  for (const page of pages) {
    const html = postProcess(render(page.view, { ...base, ...page.locals }), assetMap);
    ensureDir(join(OUT, page.out));
    writeFileSync(join(OUT, page.out), html, 'utf-8');
    console.log(`  → /${page.out}`);
  }

  // Blog posts
  for (const [slug, post] of fullPosts) {
    const html = postProcess(
      render('blog-post', { ...base, title: `${post.title} - JCH`, page: 'blog-post', currentPath: `/blog/${slug}`, post }),
      assetMap,
    );
    const out = join(OUT, 'blog', slug, 'index.html');
    ensureDir(out);
    writeFileSync(out, html, 'utf-8');
    console.log(`  → /blog/${slug}/index.html`);
  }

  // 4. Copy remaining static assets (skip hashed css/js which we already emitted)
  console.log('\n[Copying static assets]');
  copyDir(PUBLIC, OUT, HASHABLE);

  // 5. Sitemap + robots
  console.log('\n[Writing sitemap + robots]');
  const urls = ['/', '/skills', '/projects', '/about', '/contact', '/cv', '/blog'];
  for (const p of posts) urls.push(`/blog/${p.slug}`);
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${BASE_URL}${u === '/' ? '/' : u}</loc>\n    <lastmod>${lastmod(join(OUT, u === '/' ? 'index.html' : `${u}/index.html`))}</lastmod>\n  </url>`,
    )
    .join('\n');
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);

  if (!HCAPTCHA_SITE_KEY) {
    console.warn('\n!!! Contact form will be non-functional: HCAPTCHA_SITE_KEY is empty. !!!');
    console.warn('Set the real site key in fly.toml [build].args before deploying.');
  }

  console.log('\n=== Build complete ===');
  console.log(`Pages: ${pages.length}, Posts: ${fullPosts.size}, Hashed assets: ${Object.keys(assetMap).length}`);
  if (process.exitCode) {
    console.error('Build finished with errors (exit code set).');
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

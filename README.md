# Personal Website

A modern, fully-static personal website and blog — Pug templates rendered at build time,
served by **Nginx** (with hashed-immutable assets, no-cache HTML + stale-while-revalidate,
brotli/gzip, etag and security headers). The only runtime is a tiny **Fastify** server that
handles the contact form (`POST /api/contact`, Zoho Mail + hCaptcha).

## Architecture

- **Static build** (`scripts/build.ts`, run with `tsx`): renders all pages from `views/*.pug` to
  `dist-site/`, parses + sanitises blog Markdown from `content/blog/`, hashes css/js for
  immutable caching, and writes `sitemap.xml` + `robots.txt`.
- **Nginx** (`nginx.conf`): internet-facing ingress on 8080; serves `dist-site/` and proxies only
  `/api/` and `/healthz` to Fastify on `127.0.0.1:3001`.
- **Fastify** (`src/server.ts`): `POST /api/contact` (validation + hCaptcha + Zoho Mail) and
  `GET /healthz`. Bound to `127.0.0.1`, not internet-reachable.
- **No page-rendering runtime.** All HTML is prebuilt; nothing renders pages at request time.

## Design Features

### Color Palette (two themes)

- **Light (default):** background `#faf9f6`, text `#353431`, muted `rgba(25,24,22,0.6)`
- **Dark:** background `#2e2d2b`, text `#fff`, muted `rgba(240,240,240,0.6)`
- No-flash theme switcher (localStorage + `prefers-color-scheme`, inline head script, ~900ms transition)

### Typography

- **Departure Mono** — UI/menu/meta/labels (uppercase, letter-spacing 0); self-hosted
- **Source Serif 4** — body/hero/posts (serif, weight 400); self-hosted

### Design Principles

- ✨ Minimal, plain, clean layout (no dots/canvas background)
- 🎯 Content-width `min(100%, 760px)` centred
- 📱 Fully responsive (gutters 75px → 24px on mobile)
- ⚡ No external runtime CSS/JS dependencies (except the hCaptcha loader on the contact page)

## Tech Stack

### Build time

- **Pug** - templates rendered to static HTML at build time
- **Marked** - Markdown parsing (GFM)
- **gray-matter** - YAML frontmatter parsing for blog posts
- **highlight.js** - syntax highlighting
- **isomorphic-dompurify** - XSS sanitisation
- **tsx / typescript** - build tooling

### Runtime

- **Nginx** - static file serving + reverse proxy (incl. brotli/gzip)
- **Fastify** - tiny contact endpoint
- **@fastify/cors** - CORS (restricted to the site origin)
- **hcaptcha** - spam protection
- **dotenv** - environment loading

## Project Structure

```
jordancolehunt.com/
├── src/                           # Fastify server (contact endpoint)
│   ├── server.ts                  # Entry point: /api/contact, /healthz
│   └── services/
│       ├── mail.ts                # Zoho Mail integration (OAuth2 refresh token)
│       └── hcaptcha.ts            # hCaptcha verification
├── views/                         # Pug templates (rendered at build time)
│   ├── layout.pug                 # Base layout + no-flash theme init
│   ├── index.pug, skills.pug, projects.pug, about.pug
│   ├── contact.pug, cv.pug, 404.pug
│   ├── blog.pug, blog-post.pug    # Blog index + individual posts
│   └── mixins/
│       ├── nav.pug                # Top-right mono menu + theme toggle
│       └── footer.pug             # Fixed bottom footer
├── public/                        # Static assets (css/js hashed at build)
│   ├── js/                        # app.js (theme), transitions.js, image-modal.js, script.js
│   ├── styles/                    # main.css, components.css, transitions.css
│   └── fonts/                     # Self-hosted Departure Mono + Source Serif 4
├── content/
│   └── blog/                      # Markdown blog posts (submodule)
├── scripts/                       # build.ts, preview.ts, lib/blog.ts, lib/blog.selfcheck.ts
├── dist-site/                     # Static site output (git-ignored)
├── dist-server/                   # Fastify server output (git-ignored)
├── tsconfig.json
├── tsconfig.server.json           # Fastify server TS config
├── nginx.conf                     # Nginx ingress config
├── nginx-security-headers.conf    # Security headers snippet
├── supervisord.conf               # Runs nginx + fastify in container
├── Dockerfile
├── fly.toml
├── package.json
├── .env                           # Environment variables
└── CLAUDE.md                      # Development guidance
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Create or update `.env`. Public values (baked into the static HTML at build time):

   ```env
   GITHUB_USERNAME=jb9k62
   HCAPTCHA_SITE_KEY=your_site_key_here
   BASE_URL=https://jordancolehunt.com
   ```

   Runtime secrets (set as Fly secrets in production, NEVER committed):
   `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_FROM_ADDRESS`,
   `HCAPTCHA_SECRET`.

3. **Build the static site + server:**

   ```bash
   npm run build
   ```

   This renders `dist-site/` (all pages, blog, assets) and compiles `dist-server/` (Fastify).

4. **Run locally:**

   ```bash
   npm run preview   # serve dist-site/ for visual checks (http://127.0.0.1:8090)
   npm start         # run the Fastify contact endpoint (127.0.0.1:3001)
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build static site (`dist-site/`) + compile server (`dist-server/`) |
| `npm run build:static` | Render the static site to `dist-site/` |
| `npm run build:server` | Compile the Fastify server to `dist-server/` |
| `npm start` | Run the compiled Fastify server |
| `npm run dev` | Build static site, then run server in watch mode |
| `npm run preview` | Serve `dist-site/` locally |
| `npm run selfcheck` | Verify the build-time blog parser |

## Routes

### Page Routes (Server-Rendered)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Home page |
| `GET` | `/skills` | Skills page |
| `GET` | `/projects` | Projects page |
| `GET` | `/about` | About page |
| `GET` | `/contact` | Contact page |
| `GET` | `/blog` | Blog index (list of posts) |
| `GET` | `/blog/:slug` | Individual blog post |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/api/contact` | Contact form submission |

### Contact Form API

**Request:**

```json
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello! I'd like to get in touch."
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Message sent successfully!"
}
```

**Response (Error):**

```json
{
  "statusCode": 400,
  "message": "Missing required fields"
}
```

## Features

### ✨ Features

- **Static Site** - All pages rendered from Pug at build time (no page-rendering runtime)
- **Blog System** - Markdown-based blog with frontmatter support
- **Type Safety** - Fastify server + build scripts written in TypeScript
- **Email Service** - Contact form via Zoho Mail (OAuth2)
- **Security** - XSS sanitisation, path traversal protection, restricted CORS, non-root container
- **Performance** - Hashed immutable assets, no-cache HTML with CDN stale-while-revalidate
- **Syntax Highlighting** - Automatic code block highlighting with highlight.js
- **Theme Switcher** - No-flash light/dark toggle (localStorage + prefers-color-scheme)
- **Input Validation** - Email validation and required field checks

### 🎨 Frontend Features

- **Multiple Pages** - Home, Skills, Projects, About, Contact, Blog
- **View Transitions API** - Smooth cross-document transitions (Chrome 126+, Safari 18.2+)
- **GSAP Animations** - Professional page transitions and effects
- **Responsive Design** - Mobile-first approach with breakpoints
- **Form Validation** - Client-side contact form validation
- **Blog Interface** - Post listing with pinning support, individual post views
- **No Build Step** - Pure vanilla JavaScript and CSS

## Customization

### Update Personal Information

Edit Pug templates in `views/`:

- `index.pug` - Name, title, and hero section
- `about.pug` - About section text
- `skills.pug` - Technologies and skills
- `projects.pug` - Portfolio projects
- `mixins/footer.pug` - Footer information

### Change Color Scheme

Modify CSS variables in `public/styles/main.css`:

```css
:root {
  --color-text: #353431;
  --color-bg: #faf9f6;
  --color-muted: rgba(25, 24, 22, 0.6);
  --mono-font: 'Departure Mono', ui-monospace, monospace;
  --serif-font: 'Source Serif 4', Georgia, serif;
}
```

### Update Email Recipient

Edit the `toAddress` in `src/services/mail.ts`.

### Add Blog Posts

Create Markdown files in `content/blog/` with YAML frontmatter:

```markdown
---
title: Your Post Title
slug: your-post-slug
date: 2025-01-15
excerpt: A brief description of your post
author: Your Name
tags: [tag1, tag2]
pinned: false
---

Your post content here with **Markdown** formatting.
```

## Deployment (Fly.io)

### Build for Production

```bash
npm run build   # -> dist-site/ (static) + dist-server/ (Fastify)
```

### Environment Variables

- **Public (baked into HTML at build time):** `GITHUB_USERNAME`, `HCAPTCHA_SITE_KEY`, `BASE_URL`
  — set via the `[build] args` in `fly.toml`
- **Runtime secrets (set via `fly secrets set`, never baked):** `ZOHO_CLIENT_ID`,
  `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_FROM_ADDRESS`, `HCAPTCHA_SECRET`

### Deploy

```bash
fly secrets set ZOHO_CLIENT_ID=... ZOHO_CLIENT_SECRET=... ZOHO_REFRESH_TOKEN=... ZOHO_FROM_ADDRESS=... HCAPTCHA_SECRET=...
fly deploy
```

The multi-stage Docker image builds the static site and server, then runs Nginx (ingress on
8080) serving `dist-site/` while proxying `/api/contact` to the Fastify server on
`127.0.0.1:3001`, supervised together by supervisord.

## Development Notes

- **Static site**: All pages are rendered from Pug at build time to `dist-site/` — there is no
  page-rendering runtime.
- **Server**: The only runtime is the Fastify contact endpoint (`src/server.ts`), compiled to
  `dist-server/`.
- **Asset hashing**: `scripts/build.ts` hashes css/js and rewrites references, giving immutable
  cacheable URLs.
- **Theme**: No-flash light/dark switcher (localStorage + `prefers-color-scheme`, inline head script).
- **Blog posts**: Markdown in `content/blog/` is parsed, highlighted and XSS-sanitised at build time.
- **Nginx**: Serves immutable hashed assets, `no-cache` HTML with stale-while-revalidate,
  brotli/gzip, etag and security headers.

## Why This Stack?

1. **Static-first + Fastify**: pages are rendered at build time (no page runtime); the only
   runtime is a tiny, restricted Fastify endpoint for the contact form
2. **Pug Templates**: component reusability with mixins, rendered once at build time
3. **Vanilla Frontend**: No build step for client-side code keeps things fast and simple
4. **Markdown Blog**: Easy content management with frontmatter, syntax highlighting, and security built-in
5. **View Transitions**: Progressive-enhancement fade between pages
6. **Single Runtime**: One tiny Fastify process just for the contact form; everything else is static
7. **Security**: XSS-sanitised blog HTML, path-traversal guards, restricted CORS, non-root container
8. **Simplicity**: Where it matters (frontend doesn't need complex tooling)

## Blog System

The blog system supports:

- **Markdown with GFM**: GitHub Flavored Markdown for familiar syntax
- **Frontmatter**: YAML metadata for title, date, tags, and more
- **Syntax Highlighting**: Automatic code block highlighting with highlight.js
- **Pinned Posts**: Feature important posts at the top of the index
- **Security**: XSS sanitisation and path traversal protection (at build time)
- **Performance**: No-cache HTML with CDN stale-while-revalidate; hashed immutable assets

---

# Zoho scope

ZohoMail.messages.CREATE,ZohoMail.accounts.READ

Built with ❤️ using TypeScript (Pug → static HTML), Nginx, Fastify, and vanilla web technologies.

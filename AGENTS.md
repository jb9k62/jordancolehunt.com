# AGENTS.md

This file provides guidance to pi, the coding agent, when working with this repository.

## Commands

### Development
- `npm run dev` - Build the static site, then run the Fastify server with watch mode (contact endpoint only)
- `npm run build` - Build the full static site to `dist-site/` AND compile the Fastify server to `dist-server/`
- `npm start` - Start the production Fastify server (compiled, `node dist-server/server.js`)
- `npm run preview` - Serve the built static site (`dist-site/`) locally for visual checks
- `npm run selfcheck` - Verify the build-time blog parser (post counts + XSS stripping)

### Validation
- `npm run build:static` - Static site build to `dist-site/` (Pug rendered at build time)
- `npm run build:server` - Compile Fastify server to `dist-server/`

### Deployment (Fly.io)
- `fly deploy` - Build the multi-stage image and deploy
- `fly secrets set ZOHO_* HCAPTCHA_SECRET` - Set runtime secrets (never baked into the image)

Runtime secrets are set via `fly secrets set` (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`,
`ZOHO_REFRESH_TOKEN`, `ZOHO_FROM_ADDRESS`, `HCAPTCHA_SECRET`). Public build-time values
(`HCAPTCHA_SITE_KEY`, `GITHUB_USERNAME`, `BASE_URL`) are baked into the static HTML via the
`[build] args` in `fly.toml`.

### Environment Setup
Requires Node.js v18 or higher.

Environment variables are configured in `.env` (used at build/runtime where public) and via
Fly secrets (private):
- `ZOHO_CLIENT_ID` - Zoho OAuth client ID (secret)
- `ZOHO_CLIENT_SECRET` - Zoho OAuth client secret (secret)
- `ZOHO_REFRESH_TOKEN` - Zoho OAuth refresh token (long-lived, secret)
- `ZOHO_FROM_ADDRESS` - Sender email address (secret)
- `ZOHO_ACCOUNTS_URL` - Zoho accounts URL (defaults to https://accounts.zoho.com)
- `ZOHO_MAIL_URL` - Zoho mail API URL (defaults to https://mail.zoho.com)
- `HCAPTCHA_SECRET` - hCaptcha secret key (secret, runtime only)
- `HCAPTCHA_SITE_KEY` - hCaptcha site key (public, baked into contact page at build)
- `GITHUB_USERNAME` - GitHub username (public, default `jb9k62`)
- `BASE_URL` - Production base URL (public, default `https://jordancolehunt.com`)
- `PORTINT` - Fastify listen port (default 3001, internal only)

## Architecture Overview

This is a personal website: a **fully-static site** (Pug → static HTML built at build time,
served by Nginx) with a tiny **Fastify** runtime that only handles the contact form. The frontend
uses vanilla JavaScript/CSS.

### Backend (Fastify + TypeScript)

**Entry Point:** `src/server.ts` — a tiny Fastify server bound to `127.0.0.1:3001`. It has no
static-file or view-engine responsibility. It exists **only** to receive the contact form.
Routes:
- `POST /api/contact` - validates fields + email, verifies hCaptcha, sends via Zoho Mail
- `GET /healthz` - health check used by the Fly.io HCR (via Nginx proxy)

**Services:**
- `src/services/mail.ts` - Zoho Mail integration via OAuth2 refresh token (token caching).
  Ported from the old NestJS `MailService`.
- `src/services/hcaptcha.ts` - hCaptcha token verification. Ported from the old
  `HcaptchaService`.

**Compilation:** `tsconfig.server.json` compiles `src/**` to `dist-server/` (CommonJS, ES2021).

> The old NestJS controllers/modules (`src/controllers/*`, `src/dto/*`, `src/app.module.ts`,
> `src/main.ts`) were removed. All page rendering now happens at **build time**.

### Static site (build-time rendering)

**Build script:** `scripts/build.ts` (run via `tsx`) renders every page to static HTML in
`dist-site/` and hashes css/js assets for immutability. It uses `scripts/lib/blog.ts` (a
build-time port of the old `BlogService`) for Markdown parsing, syntax highlighting, DOMPurify
XSS sanitisation, path-traversal protection, draft filtering and pin-then-date sorting.

**Nginx** (`nginx.conf`) is the only internet-facing process (port 8080). It serves `dist-site/`
(with immutable hashed assets, no-cache HTML + SWR, brotli/gzip, etag, security headers) and
proxies only `/api/` and `/healthz` to Fastify on `127.0.0.1:3001`. In production, `supervisord`
runs both Nginx (foreground) and Fastify.

### Frontend (Pug + Vanilla JS + CSS)

**Template System:** Pug templates in `views/`
- `layout.pug` - Base layout with navigation, footer, theme-init inline script, and hashed script imports
- Page-specific templates: `index.pug`, `skills.pug`, `projects.pug`, `about.pug`, `contact.pug`, `blog.pug` (blog index), `blog-post.pug` (individual posts), `404.pug`
- Mixins: `views/mixins/nav.pug`, `views/mixins/footer.pug`
- Each page receives `title`, `page`, `currentPath`, plus build-time values (`githubUrl`, `hcaptchaSiteKey`, `cvPath`)
- Blog pages also receive `posts` (index) or `post` (individual) data

**Static Assets:** `public/` (copied verbatim; css/js hashed at build time)
- `js/app.js` - Theme switcher (light/dark, persisted to localStorage, no-flash init)
- `js/transitions.js` - View Transitions lifecycle (no GSAP dependency)
- `js/image-modal.js` - Lightbox for project architecture images
- `script.js` - Contact form handler (vanilla fetch to `/api/contact`)
- `styles/main.css` - Design tokens (@font-face, light/dark themes, base styles)
- `styles/components.css` - Component styles (menu, footer, cards, forms, posts)
- `styles/transitions.css` - View Transitions API styles
- `fonts/` - Self-hosted Departure Mono + Source Serif 4

**Design System:**
- Monochrome grey-white light theme (`#faf9f6` bg / `#353431` text) with a near-black dark theme
- Typography: Departure Mono (UI/menu/meta, uppercase, letter-spacing 0) + Source Serif 4 (body/hero)
- Theme switcher with no-flash inline head script, persisted choice, ~900ms transition
- No external runtime CSS/JS dependencies (except the hCaptcha loader on the contact page)

### Build System

- `scripts/build.ts` (static site) + `tsc -p tsconfig.server.json` (Fastify server)
- `npm run build` runs both and must succeed before deploy
- Output: `dist-site/` (static) and `dist-server/` (Fastify)
- Self-hosted fonts are static assets in `public/fonts/` (no Google Fonts at runtime)

## Content Management

### Blog System

**Storage:** Blog posts are Markdown files in `content/blog/` directory

**Frontmatter Structure:** Each post requires YAML frontmatter with:
- `title` (required) - Post title
- `slug` (required) - URL-friendly identifier
- `date` (required) - Publication date (YYYY-MM-DD)
- `excerpt` (required) - Short description for index page
- `author` (optional) - Defaults to "Jordan Cole Hunt"
- `tags` (optional) - Array of category tags
- `pinned` (optional) - Set to `true` to pin post at top of index

**Markdown Processing:**
- `gray-matter` - Parses YAML frontmatter
- `marked` - Converts Markdown to HTML with GitHub Flavored Markdown (GFM) support
- `highlight.js` - Automatic syntax highlighting for code blocks
- `isomorphic-dompurify` - XSS sanitisation of rendered HTML

**Routes:**
- `GET /blog` - Blog index page (list of all posts sorted by date, pinned posts first)
- `GET /blog/:slug` - Individual blog post page

**Security Features:**
- Path traversal protection (validates all slugs stay within `content/blog/`)
- XSS sanitisation (DOMPurify whitelist of safe HTML tags and attributes)
- CDN-optimised cache headers for performance

**Post Sorting:**
1. Pinned posts appear first
2. Remaining posts sorted by date (newest first)

### Blogging Style & Guidelines

**Tone & Voice:**
- Friendly and casual yet professional
- Conversational but authoritative - write as if explaining to a colleague over coffee
- Approachable without being overly informal

**Personality:**
- Fun and quirky - don't be afraid to show character
- Detail-orientated - dive deep into technical specifics when relevant
- Use anecdotes and real-world analogies to make complex concepts relatable
- Sprinkle in humour naturally (avoid forced jokes)

**Writing Style:**
- Lead with the "why" before the "how"
- Use concrete examples and code snippets to illustrate points
- Break down complex topics into digestible sections
- Include practical takeaways and actionable advice
- Acknowledge trade-offs and different perspectives

**Cultural Context:**
- Author is based in South Africa - occasional local references are welcome
- Examples and analogies can draw from South African context where appropriate (e.g., load shedding for discussing system resilience)
- Keep content globally accessible but don't erase local flavour

**Language Standards:**
- Use UK English spelling and conventions
- Examples: specialisation (not specialization), organised (not organized), colour (not color)
- Use 's' instead of 'z' in words like recognise, optimise, analyse
- Date format: DD/MM/YYYY or "15 January 2025"

**Technical Writing:**
- Prioritise clarity over cleverness
- Explain jargon when first introduced
- Use code blocks liberally with proper syntax highlighting
- Include context for why a technical decision was made
- Mention edge cases and potential pitfalls

**Humour Guidelines:**
- Keep it light and relevant to the topic
- Self-deprecating humour works well
- Avoid sarcasm that might confuse non-native English speakers
- If in doubt, choose clarity over comedy

## Key Behaviors

**Static Asset Handling:**
- `scripts/build.ts` copies `public/` into `dist-site/` and hashes css/js during build
- Nginx serves `dist-site/` at root; only `/api/*` and `/healthz` are proxied to Fastify
- Hashed assets get immutable caching; HTML is served `no-cache` with CDN stale-while-revalidate

**Page Navigation:**
- Each page is a prebuilt static HTML file (Pug rendered at build time)
- View Transitions API provides smooth transitions (when supported)
- No GSAP — transitions are pure CSS; no animations need re-initialising on navigation

**Contact Form Flow:**
1. Client submits POST to `/api/contact` with name, email, message, and hCaptcha token
2. Fastify (`src/server.ts`) validates fields and email format
3. `verifyHcaptcha` verifies the captcha token
4. `sendContactEmail` sends email via Zoho Mail API
5. Returns success/error JSON response

## Important Implementation Notes

- The frontend uses NO build step - vanilla JS/CSS served directly
- TypeScript is ONLY used for backend (src/)
- View Transitions require @view-transition at-rule support (newer browsers)
- GSAP animations need cleanup/re-init on navigation to prevent memory leaks
- API routes must be excluded from static serving to avoid conflicts

## Deployment

- The site is deployed on **fly.io**. Fetching Fly.io docs while working on deployment is expected and allowed (web access is provided by the `pi-web-access` extension).
- `npm run build` must succeed before deploying.

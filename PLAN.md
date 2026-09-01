# PLAN — Re-architecture of jordancolehunt.com to a static site (Nginx + Fastify endpoint)

Author: Architect (planning phase). Status: **FINAL — no open questions.**

This plan makes the site a fully static build (HTML/CSS/JS generated at build time, served by
Nginx) with a single tiny runtime process (Fastify) that exists **only** to receive the contact
form. NestJS, the runtime Pug engine, the ServeStaticModule, GSAP/CDN dependencies and the dotted
canvas background are all removed.

---

## A. Target architecture

```
                        Internet (HTTPS, fly.io proxy → in:8080)
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │      NGINX           │    ingress, internal_port 8080
                          │  (static + proxy)    │
                          └──────────┬──────────┘
                     ┌───────────────┴───────────────┬──────────────────┐
                     │                               │                  │
           ┌─────────▼─────────┐         ┌───────────▼─────────┐    proxied to
           │  dist-site/*      │         │  127.0.0.1:3001     │    Fastify
           │  (prebuilt html,  │         │  Fastify (TINY)     │
           │   hashed css/js,  │         │  POST /api/contact  │
           │   images, fonts)  │         │  GET  /healthz      │
           └───────────────────┘         └─────────────────────┘
                                                       │
                                         Zoho Mail API (OAuth2 refresh token)
                                         hCaptcha verify (HCAPTCHA_SECRET)
```

- **Nginx** owns the HTTP lifecycle on port **8080** (the only port Fly exposes). It serves every
  prebuilt static asset from `dist-site/` and proxies only `/api/` and `/healthz` to Fastify on
  `127.0.0.1:3001`.
- **Fastify** listens on `127.0.0.1:3001` (internal only — not reachable from the internet).
  It exposes exactly two routes: `POST /api/contact` and `GET /healthz`. It has no static-file
  responsibility and no view engine.
- **There is no runtime for rendering pages.** All pages, blog posts, sitemap and robots are
  generated once by `scripts/build.ts` before the image is built.

---

## B. Static build pipeline (`scripts/build.ts`)

Executed with `tsx` (dev dependency — must be added). It reads the repo and writes a fully
self-contained static site to **`dist-site/`**.

### B.1 Sources it consumes
- `views/**/*.pug` — kept as-is; rendered by **Pug at build time** (no runtime Pug).
- `content/blog/*.md` — Markdown blog posts; parsed at build time.
- `public/**` — copied verbatim into `dist-site/`.

### B.2 Build steps (in order)
1. **Load config** — `GITHUB_USERNAME` (default `'jb9k62'`), `HCAPTCHA_SITE_KEY`, `BASE_URL`
   (default `https://jordancolehunt.com`), `CV_PATH` (`/cv/resume-v2.pdf`). These are baked into
   HTML at build time (they are public values, not secrets).
2. **Hash css/js** — read every file under `public/styles/*.css` and `public/js/*.js`, compute
   `md5` (or a short content hash, e.g. 12 hex chars), and build an **asset map**:
   - `/styles/main.css` → `/styles/main.<hash>.css`
   - `/styles/transitions.css` → `/styles/transitions.<hash>.css` (if kept)
   - `/styles/components.css` → `/styles/components.<hash>.css`
   - `/js/app.js` → `/js/app.<hash>.js`, etc.
   Write hashed copies into `dist-site/`. Images, fonts, `favicon.svg` and `pdf` are **not**
   renamed (served with long cache lifetimes instead — see §G).
3. **Parse blog** — port the logic from `src/services/blog.service.ts` into a small build module
   `scripts/lib/blog.ts` (reusing `gray-matter` + `marked` + `highlight.js` + `isomorphic-dompurify`),
   preserving:
   - `validatePath` path-traversal guard (reject slugs escaping `content/blog`),
   - required-frontmatter checks (`title`, `date`), draft exclusion,
   - pin-then-date sorting for the index,
   - XSS sanitisation (DOMPurify `ALLOWED_TAGS`/`ALLOWED_ATTR` whitelist) and the `marked` code
     renderer with `highlight.js`.
4. **Render pages** to static HTML with `pug.renderFile` / `pug.compileFile`, passing the same
   locals the NestJS controllers passed (`title`, `page`, `currentPath`, `posts`, `post`,
   `cvPath`, `githubUrl`, `hcaptchaSiteKey`, and the hashed **asset map**). Pages:
   - `/` → `dist-site/index.html`
   - `/skills` → `dist-site/skills/index.html`
   - `/projects` → `dist-site/projects/index.html`
   - `/about` → `dist-site/about/index.html`
   - `/contact` → `dist-site/contact/index.html`
   - `/cv` → `dist-site/cv/index.html`
   - `/blog` → `dist-site/blog/index.html`
   - `/blog/:slug` → `dist-site/blog/:slug/index.html` (real files → clean URLs with zero rewrite)
   - `/404` → `dist-site/404.html`
   Use the **404 page** if a slug is missing/erroring (links stay valid; Nginx `try_files` falls
   back to `404.html`).
5. **Post-process asset references** — after rendering each HTML file, string-replace the literal
   asset URLs (`/styles/main.css`, `/styles/components.css`, `/styles/transitions.css`,
   `/js/app.js`, `/js/transitions.js`, `/js/image-modal.js`) with their hashed counterparts from the
   map. This keeps the Pug templates unchanged in their hardcoded references while producing
   immutable cacheable URLs. (The one non-hashed runtime script on the contact page, the hCaptcha
   loader, stays a CDN URL.)
6. **Copy static assets** — copy `public/**` into `dist-site/` (fonts, images, `favicon.svg`,
   `cv/resume-v2.pdf`, `index.html` is superseded by the rendered root and can be dropped/renamed).
7. **Write `sitemap.xml`** — list `/,/skills,/projects,/about,/contact,/cv,/blog` plus every
   `/blog/:slug`, with `BASE_URL` prefix and lastmod from file mtimes.
8. **Write `robots.txt`** — allow all, point to `sitemap.xml`.
9. **Log summary** — count pages, posts, hashed assets; exit non-zero on any post parse error so
   the build fails loudly.

### B.3 Output layout (`dist-site/`)
```
dist-site/
├── index.html  skills/index.html  projects/index.html
├── about/index.html  contact/index.html  cv/index.html  404.html
├── blog/index.html
├── blog/<slug>/index.html      (one per post)
├── styles/*.<hash>.css          (hashed, immutable)
├── js/*.<hash>.js               (hashed, immutable)
├── images/…  fonts/…  cv/resume-v2.pdf  favicon.svg  (unhashed, long-cache)
├── sitemap.xml  robots.txt
```

The frontend remains **vanilla JS/CSS — no frontend build/minification step** required (kept simple
and grep-able). Fonts are **self-hosted** in `public/fonts/` (`departure-mono-regular.woff2`
already exists; add `Source Serif 4` woff2 files there — see §C).

---

## C. Theme switcher + redesign (frontend)

### C.1 Fonts
- **Menu/labels/UI/meta**: `Departure Mono` (self-hosted, already in `public/fonts/`). UPPERCASE,
  `letter-spacing: 0`, weight 400.
- **Body/hero/posts**: serif — **`Source Serif 4`**, weight 400. Self-host its woff2 into
  `public/fonts/` and declare `@font-face` (add the files in the implement phase; woff2 woff
  supported by all modern browsers). No Google Fonts CDN at runtime (matches the no-dependency,
  self-contained static goal).

### C.2 Design tokens (`public/styles/main.css` — replaced)
Implement the token map from `DESIGN_SPEC.md` §3 verbatim:
```css
:root {
  --mono-font: 'Departure Mono', ui-monospace, monospace;
  --serif-font: 'Source Serif 4', serif;
  --font-size-xs: 0.8125rem; --font-size-sm: 0.9375rem; --font-size-md: 1.0625rem;
  --font-size-lg: 1.25rem;   --font-size-xl: 1.375rem; --font-size-2xl: 1.625rem; --font-size-3xl: 2.25rem;
  --text-ui: 0.9375rem; --text-meta: 0.9375rem; --text-body: 0.9375rem;
  --text-reading: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
  --text-title: 1.25rem; --text-hero: clamp(1.25rem, 0.875rem + 1.5vw, 2.5rem);
  --leading-ui: 1.25; --leading-body: 1.6; --leading-tight: 1.15;
  /* light (default) */
  --color-text: #353431; --color-bg: #faf9f6; --color-muted: rgba(25,24,22,0.6);
  --frame-inline: 75px; --frame-block: 75px; --content-width: min(100%, 760px);
  --theme-transition: 900ms;
}
html[data-theme='dark'] {
  --color-text: #fff; --color-bg: #2e2d2b; --color-muted: rgba(240,240,240,0.6);
  /* body element uses #1a1a1a */
}
@media (max-width: 640px) { :root { --frame-inline: 24px; --frame-block: 20px; } }
@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
```

### C.3 Theme switch mechanism
- **Light is default.** `data-theme="dark"` on `<html>` triggers dark vars.
- **Tiny inline `<head>` script** (no flash of wrong theme): before first paint, read
  `localStorage['theme']`; if missing, fall back to `prefers-color-scheme: dark`; then set
  `document.documentElement.dataset.theme` if dark.
- **Visible toggle button** in the top-right menu (mono, uppercase, e.g. `LIGHT/DARK` or an icon):
  on click flips the `data-theme`, persists to `localStorage`, and updates the label.
- **Transition ~900ms** on background/colour, disabled under `prefers-reduced-motion`.

### C.4 Layout/chrome (Pug + CSS changes)
- **Navigation**: top-right corner, mono UPPERCASE `MENU`, minimal, borderless, near-transparent
  background; menu links: Home, Skills, Projects, About, Blog, CV, Contact.
- **Footer**: fixed to bottom, mono UPPERCASE labels split left/right ("JORDAN COLE HUNT" /
  small mono label). No border/background.
- **Drop the dot background** — remove `public/js/dots-background.js` from `layout.pug` and delete
  the file; no canvas. Also remove GSAP CDN + `transitions.js` dot/GSAP glue, and the Lucide CDN
  + `unpkg` usage (replace any icon markup with simple text or inline SVG). This removes all
  external runtime CDN dependencies.
- **Hero (home)**: large italic serif quote on the plain light page (optionally the dark starry
  hero treatment from the spec — default to the light content-page style for consistency).
- **Content**: `max-width: min(100%, 760px)` centered (`--content-width`), `--frame-inline`
  gutters.
- **Contact page**: keep the form + hCaptcha (site key baked in), keep `public/script.js` form
  handler (POST to `/api/contact`), drop Lucide/GSAP extras.
- **`layout.pug` changes**: swap font links (remove Space Grotesk & Lucide & GSAP; keep the two
  hashed local css + js + the theme init inline script + hCaptcha scripts only on the contact
  page). `nav.pug` and `footer.pug` rewritten to the new chrome.

---

## D. Fastify server (`src/server.ts`)

### D.1 Bootstrap
```ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { mailService } from './services/mail';      // ported from src/services/mail.service.ts
import { verifyHcaptcha } from './services/hcaptcha'; // ported from src/services/hcaptcha.service.ts

const PORT = Number(process.env.PORTINT || process.env.PORT || 3001);
const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
```
- Listen on `127.0.0.1:3001` (bind host `127.0.0.1` so it is not internet-reachable; Nginx is the
  sole ingress). Read host from `process.env.PORTINT || 3001` default.

### D.2 Routes
- `POST /api/contact` — identical contract to the existing NestJS `ContactController`:
  1. body JSON `{ name, email, message, 'h-captcha-response' }`;
  2. validate required fields + email regex → `400` on failure;
  3. verify hCaptcha (pass the client IPs: `x-forwarded-for`, `x-real-ip`, socket remote) →
     `400`/`500` on failure;
  4. `mailService.sendContactEmail(name, email, message)` →
     `{ success: true, message: 'Message sent successfully!' }` or `500`.
  5. Reply via `reply.code(200).send(...)`; Fastify automatically returns JSON.
- `GET /healthz` — `{ status: 'ok', timestamp }`, `no-store`, no DB dependency (used by Fly
  health check through Nginx).
- **No-store on all `/api` and `/healthz`** replies — set `Cache-Control: no-store` via an
  `onSend` hook for those prefixes (plus `Pragma: no-cache`, `Expires: 0`).

### D.3 Service ports
- `src/services/mail.ts` — convert `MailService` class to a plain module/class with the same
  `refreshAccessToken`, `getAccountId`, `sendContactEmail` logic (fetch + OAuth2 refresh token,
  token caching with 5-min buffer). Reads `ZOHO_*` env vars.
- `src/services/hcaptcha.ts` — convert `HcaptchaService` to a function using the `hcaptcha`
  package's `verify` with `HCAPTCHA_SECRET`.
- Remove `@nestjs/*`, `class-validator`, `class-transformer`, `express` types from the server
  path. Fastify's built-in JSON body parsing + explicit validations replace class-validator.

### D.4 Compilation
- New `tsconfig.server.json` (compiles `src/**` → `dist-server/`, CommonJS, ES2021, decorators
  not needed but harmless; `outDir: dist-server`, `rootDir: src`, libraries/`skipLibCheck`).
- `src/server.ts` is the entry point. Only `src/services/mail.ts`, `src/services/hcaptcha.ts`,
  and `src/server.ts` are needed by the runtime (delete the NestJS controllers/modules/app files
  as part of the cleanup, or leave them out of the server compile).

---

## E. Nginx (`nginx.conf` + `nginx-sites` conf)

Runtime user/group `nginx`, `root /app/dist-site`. Key directives:
- `listen 8080 default_server;` (matches `fly.toml` `internal_port`). `server_name jordancolehunt.com`.
- **Compression**: `gzip on; gzip_types text/html text/css application/javascript application/json
  image/svg+xml application/xml;` and Brotli via the `nginx-mod-http-brotli` alpine package
  (`brotli on; brotli_comp_level 6; brotli_types ...same...`). Both gzip+brotli on, Vary:
  Accept-Encoding.
- **Static file locations:**
  - Hashed assets — `location ~* ^/styles/.+\.css$` and `location ~* ^/js/.+\.js$` →
    `add_header Cache-Control "public, max-age=31536000, immutable";` (all our css/js are hashed).
  - Images/fonts — `location ~* \.(png|jpe?g|gif|webp|svg|woff2?|pdf)$` →
    `add_header Cache-Control "public, max-age=31536000, immutable";` (static, content-addressed by
    repo changes; fine to be long-lived).
  - `favicon.svg` → same immutable treatment.
  - HTML — `location ~* \.html$` and `/` handling → `add_header Cache-Control "no-cache";` +
    `CDN-Cache-Control "public, max-age=3600, stale-while-revalidate=86400";` (fresh on each
    request, background-revalidated in CDN).
- **Proxy**: `location ^~ /api/ { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host;
  X-Forwarded-For $proxy_add_x_forwarded_for; X-Real-IP $remote_addr; }` and
  `location = /healthz { proxy_pass http://127.0.0.1:3001/healthz; ... }`. Fastify must be up
  before Nginx (see §F supervisor ordering).
- **Clean URLs / 404**: `try_files $uri $uri/ /404.html =404;` — blog posts exist as real
  `blog/:slug/index.html` files so no rewrite needed; unknown paths gracefully serve `404.html`.
- **Security headers** (all responses): `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal set.
- **Etags** on: gives conditional GETs for static files (`etag on;`).

---

## F. Deployment / fly.io

### F.1 Multi-stage Dockerfile (replace current single-stage)
```dockerfile
# --- Stage 1: build static site + compile server ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                       # includes devDeps (tsx, typescript)
COPY . .                         # content submodule + public/fonts included (see .dockerignore)
RUN npm run build                # -> dist-site/ (static) + dist-server/ (fastify)

# --- Stage 2: runtime ---
FROM node:20-alpine
RUN apk add --no-cache nginx nginx-mod-http-brotli supervisor
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force   # fastify + hcaptcha + nothing else needed at runtime
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/dist-site  ./dist-site
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
ENV PORTINT=3001 NODE_ENV=production
EXPOSE 8080
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
```
- `supervisord.conf`: program `fastify` → `node dist-server/server.js` (autorestart, startsecs 0),
  then program `nginx` → `nginx -g 'daemon off;'` (starts after fastify so the proxy target is
  ready; autorestart). Nginx runs in the foreground as the primary process; supervisord supervises
  both and reaps signals.
- **Build-time values** required: `HCAPTCHA_SITE_KEY`, `GITHUB_USERNAME`, `BASE_URL` are baked into
  static HTML. Pass them via `docker build --build-arg`/`ARG`+`ENV` (they are public, not secrets).
- **Runtime secrets** via `fly secrets set` (never baked): `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`,
  `ZOHO_REFRESH_TOKEN`, `ZOHO_FROM_ADDRESS`, `HCAPTCHA_SECRET`.

### F.2 fly.toml (updated)
```toml
app = 'jordancolehunt-com'
primary_region = 'jnb'
[env]
  NODE_ENV = 'production'
  PORTINT = '3001'
[http_service]
  internal_port = 8080        # Nginx ingress
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  max_machines_running = 1
[[vm]]
  size = 'shared-cpu-1x'
```
No change needed to keep min machines 0 / shared-cpu-1x. Health checks should hit `/healthz`
(GET) so the machine is considered healthy only once Fastify + Nginx are up.

### F.3 `.dockerignore`
Current entries already exclude `node_modules`, `dist`, `.env`, `*.md` **except**
`content/**/*.md`, and keep `.gitignore` separate. Add:
- `dist-site`, `dist-server` (and keep `/dist`),
- keep `content/` allowed (submodule .md needed for blog build),
- keep `public/fonts/**` (font woff2 must not be ignored — it isn't),
- ensure `.pi`, `tests`, `playwright.config.ts` excluded (optional, keeps image lean).
Then `npm run build` runs inside the builder where the `content` submodule is present.

### F.4 Deploy
`fly deploy` (no `fly launch` changes needed). Verify with `curl` against the app URL:
`/`, `/blog/<slug>`, a hashed css asset (expect `immutable`), and `POST /api/contact` (expect
hCaptcha gate, then 200 when a valid token is supplied).

---

## G. Caching table

| Route / asset                 | Cache-Control                              | CDN-Cache-Control                           | Notes |
|-------------------------------|--------------------------------------------|---------------------------------------------|-------|
| `*.css`/`*.js` (hashed)       | `public, max-age=31536000, immutable`      | —                                           | Content-addressed filenames → safe to cache forever |
| Images (png/jpg/webp/svg)     | `public, max-age=31536000, immutable`      | —                                           | Rarely change |
| Fonts (`woff2`)               | `public, max-age=31536000, immutable`      | —                                           | versioned by file |
| `cv/resume-v2.pdf`            | `public, max-age=31536000, immutable`      | —                                           | versioned by filename |
| `favicon.svg`                 | `public, max-age=31536000, immutable`      | —                                           | |
| HTML pages (`/`, `/blog/…`)   | `no-cache`                                 | `public, max-age=3600, stale-while-revalidate=86400` | Always revalidate browser; CDN serves fresh+SWR |
| `404.html`                    | same as HTML                               | same                                        | |
| `POST /api/contact`           | `no-store, no-cache, must-revalidate, private` (+ `Pragma: no-cache`) | — | Sensitive/dynamic |
| `GET /healthz`                | `no-store`                                 | —                                           | internal |
| `sitemap.xml`/`robots.txt`    | `no-cache` + CDN `max-age=3600,swr=86400`  | —                                           | |

Best-practice rationale: hashed assets are immutable → 1-year immutable. HTML is cheap to render
(at Nginx it's just a file) so `no-cache` at the browser (revalidate) while letting the CDN hold a
1-hour copy with stale-while-revalidate for resilience. API responses are dynamic and must never
be cached.

---

## H. package.json scripts

Add deps: `fastify`, `@fastify/cors` (runtime); `tsx`, plus keep `typescript` (dev);
`gray-matter`, `marked`, `highlight.js`, `isomorphic-dompurify`, `pug`, `hcaptcha` are build/runtime
shared (all already present). Remove `@nestjs/*`, `class-validator`, `class-transformer`,
`reflect-metadata` (unless still transitively needed — drop them). `gsap` is no longer imported in
the frontend but may remain in package.json; remove if unused.

```jsonc
"scripts": {
  "build": "npm run build:static && npm run build:server",
  "build:static": "tsx scripts/build.ts",
  "build:server": "tsc -p tsconfig.server.json",
  "start": "node dist-server/server.js",
  "dev": "npm run build:static && tsx watch src/server.ts",
  "preview": "node scripts/preview.ts"      // lightweight static server for dist-site (see §I-task 6)
}
```
`npm run build` must succeed end-to-end (this is the golden verification checkpoint).

---

## I. Ordered task list (for the implementer)

> Each task ends with a **checkpoint**. The build must run before proceeding.

1. **Dependencies & tsconfig**
   - Add `fastify`, `@fastify/cors` (deps) and `tsx` (dev). Create `tsconfig.server.json`
     (`outDir: dist-server`, `rootDir: src`). Add `dist-site`, `dist-server` to `.gitignore`.
   - ✅ `npx tsc -p tsconfig.server.json --noEmit` passes; `npx tsx -e "console.log('ok')"` runs.

2. **Build module: blog parser** (`scripts/lib/blog.ts`)
   - Port `BlogService` (frontmatter, draft filter, pin-then-date sort, `validatePath` traversal
     guard, `marked`+highlight.js renderer, DOMPurify sanitisation) to a pure build-time module.
   - ✅ Add a tiny `scripts/lib/blog.selfcheck.ts` (or a `--selfcheck` flag) that parses
     `content/blog` and prints N posts; run with `tsx` — no errors, XSS test snippet stripped.

3. **Build script: static site** (`scripts/build.ts`)
   - Hash css/js → asset map; render all pages (`index, skills, projects, about, contact, cv,
     blog, blog/:slug, 404`); post-process asset refs; copy `public/`; write `sitemap.xml`,
     `robots.txt`. Pass build-time locals (github, hcaptchaSiteKey, cvPath, BASE_URL, posts, post).
   - ✅ `npm run build:static` produces `dist-site/` with expected files; grep a rendered page for
     a hashed css `<hash>` path and correct blog HTML.

4. **Redesign frontend (Pug + CSS)**
   - Rewrite `layout.pug`, `mixins/nav.pug`, `mixins/footer.pug` to the new chrome; remove
     Space Grotesk/Lucide/GSAP/dots; add theme init inline script + toggle. Rebuild `main.css`
     with the token map from §C; update `components.css`; add `Source Serif 4` to `public/fonts/`;
     delete `dots-background.js`; prune `app.js`/`transitions.js`/`image-modal.js` to only what is
     needed (keep it small/vanilla).
   - ✅ `npm run build:static` again; open `dist-site/index.html` in a browser (or Playwright)
     — light default, toggle flips to dark with ~900ms transition, no theme flash on reload, no
     dotted background, mono menu top-right, fixed footer.

5. **Fastify server** (`src/server.ts`, `src/services/mail.ts`, `src/services/hcaptcha.ts`)
   - Port services + server; routes `POST /api/contact`, `GET /healthz`; no-store on `/api` +
     `/healthz`; CORS; listen `127.0.0.1:3001`.
   - ✅ `npm run build:server` ; start `node dist-server/server.js` and `curl /healthz` →
     `200 {"status":"ok"}`; `curl -X POST /api/contact` with bad payload → `400`; missing hCaptcha
     token → `400`.

6. **Nginx config + local preview**
   - Write `nginx.conf` (§E). Add `scripts/preview.ts` (serves `dist-site/` locally on 8080, and
     optionally inlines a tiny `/api` mock for form testing).
   - ✅ Start Nginx locally against `dist-site/`; verify: `/` and `/blog/<slug>` return 200 with
     HTML headers (no-cache), hashed css returns `immutable` + brotli/gzip, `/api/port`→404 vs
     unknown path→`404.html`, `try_files` clean-URL works.

7. **Dockerfile + supervisord + fly.toml + .dockerignore**
   - Multi-stage build §F.1; `supervisord.conf`; update `fly.toml` (§F.2); update `.dockerignore`
     (§F.3).
   - ✅ `docker build -t site .` succeeds and `docker run` shows both `fastify` and `nginx`
     up (supervisord logs); `curl localhost:8080` and `curl localhost:8080/healthz` work from host.

8. **Secrets + verification on fly.io**
   - `fly secrets set ZOHO_* HCAPTCHA_SECRET`; `fly deploy`.
   - ✅ Post-deploy smoke test: `curl -sI https://jordancolehunt.com/` (`no-cache` HTML),
     `curl -sI <hashed css>` (`immutable`), `curl -s healthz` (`200`), and a real contact submit
     (with a valid hCaptcha) reaches Zoho (check inbox / API log), and an invalid captcha is
     rejected with `400`.

9. **Cleanup**
   - Delete `src/app.module.ts`, `src/controllers/*`, `src/dto/*`, `nest-cli.json`,
     `src/main.ts` (NestJS), unused GSAP/Lucide/dots files; update `README.md` + `AGENTS.md`
     commands to the new `npm run build` / `npm start` / `fly deploy` flow.
   - ✅ Final `npm ci && npm run build` from a clean tree passes; commit.

---

## J. Risks / edge cases & mitigations

| Risk | Mitigation |
|------|-----------|
| **Blog XSS** | Port the DOMPurify whitelist + `marked` renderer unchanged to build; sanitise in the build step; no user input is ever rendered at runtime. |
| **Path traversal on slugs** | Keep `validatePath` (`normalize` + `relative` containment check); build maps slugs explicitly from `readdirSync(content/blog)` so only discovered files become pages. |
| **Pug at build time** | `pug.compileFile` with the same locals as the old controllers; 404 page for missing slugs; verify every page renders or `build.ts` fails. |
| **Hashed asset references inside Pug** | Post-process replace after render (asset map); also replace references inside any hashed CSS `url()` only if needed (images/fonts unhashed so none). Self-contains bundled paths. |
| **Theme flash (FOUC)** | Inline `<head>` script runs before first paint; localStorage → `prefers-color-scheme` fallback; only sets `data-theme` when dark (light is the default so no jump). |
| **Nginx ↔ Fastify startup ordering** | Supervisord starts `fastify` (autorestart, startsecs 0) before `nginx`; Fastify autorestart keeps proxy target alive; Nginx `proxy_next_upstream` tolerates brief unavailability. |
| **Nginx brotli availability** | Use alpine `nginx-mod-http-brotli` package + `load_module` line; fall back to gzip-only if the module is unavailable in CI (gzip always enabled). |
| **Fly machine config drift** | Keep `min_machines_running = 0`, `shared-cpu-1x`, `internal_port 8080`, `PORTINT=3001`; health check against `/healthz` (via Nginx proxy) so machines only start when both processes are ready. |
| **Secrets leaking into static HTML** | Only public values baked into HTML (`HCAPTCHA_SITE_KEY`, `GITHUB_USERNAME`, `BASE_URL`); secrets (`ZOHO_*`, `HCAPTCHA_SECRET`) exist only as Fly runtime secrets for Fastify. |
| **Missing fonts in container** | `fonts/*.woff2` explicitly allowed in `.dockerignore`; verify in deployed output. |
| **`content` submodule absent during build** | `build.ts` fails with a clear error if `content/blog` is missing; Docker build uses `COPY . .` which includes the submodule (ensure it's checked out in CI/deploy). |
| **`no-cache` HTML vs SEO crawlers** | `no-cache` still lets crawlers read content (it means revalidate, not don't-store); sitemap + robots provided; CDN `stale-while-revalidate` keeps it fast. |
| **Contact endpoint reachability** | Only Nginx is exposed (8080); Fastify bound to `127.0.0.1:3001` — fastify is not internet-reachable, only via Nginx proxy. CORS allows the site origin. |

---

**Done criteria (acceptance):** `npm run build` produces `dist-site/` + `dist-server/` and succeeds;
the site is fully static behind Nginx with hashed-immutable assets, no-cache HTML with SWR CDN,
brotli/gzip, etag and security headers; theme switcher works with no flash; the only runtime is the
Fastify contact endpoint on `127.0.0.1:3001`, reachable via `/api/contact`; a Fly deploy (min 0,
shared-cpu-1x) passes the post-deploy smoke tests in Task 8.

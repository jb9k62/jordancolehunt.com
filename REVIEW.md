# REVIEW — Static-site re-architecture (reviewer pass)

Reviewed against: PLAN.md, DESIGN_SPEC.md, README.md and the new implementation
(`scripts/build.ts`, `scripts/lib/blog.ts`, `src/*`, `nginx.conf`, `Dockerfile`,
`fly.toml`, `supervisord.conf`, `package.json`, tsconfigs, `public/**`, `views/**`,
and a sample of `dist-site/`).

`npm run build` was executed end-to-end and **succeeds** (exit 0): 8 pages, 6 blog
posts, 7 hashed assets; `tsc -p tsconfig.server.json` compiles cleanly. Hashed asset
references were verified in the built HTML and are correctly rewritten.

Verdict: **Conditionally approve** — the core architecture (static build + Nginx + tiny
Fastify endpoint) is sound and mostly correct, but there are **2 high-severity
functional blockers** (empty hCaptcha site key in prod; 404s serving HTTP 200) plus a
handful of caching, security-hygiene and design-fidelity issues that should be fixed
before shipping.

---

## Severity-ranked issues

### HIGH

**1. hCaptcha site key is empty → contact form is non-functional in production**
- `fly.toml:6` — `args = { ... HCAPTCHA_SITE_KEY = '' ... }`
- `scripts/build.ts:28` — `const HCAPTCHA_SITE_KEY = process.env.HCAPTCHA_SITE_KEY || '';`
- Consequence (verified in `dist-site/contact/index.html`): `<div class="h-captcha" data-sitekey="">`. The hCaptcha widget renders nothing and every submit is silently blocked (`script.js` refuses to POST without a token). The contact form — the *only* runtime feature — is dead.
- Fix: set the real site key in `fly.toml [build].args` (and `[build]` `dockerfile` consumed ARG). Add a build-time guard in `build.ts` that warns/fails if `HCAPTCHA_SITE_KEY` is empty.

**2. 404 responses return HTTP 200, not 404**
- `nginx.conf:126` and `nginx.conf:136` — `try_files $uri $uri/ /404.html =404;`
- The third `try_files` argument (`/404.html`) always exists, so nginx internally redirects to `/404.html` with **status 200**. The `=404` clause is dead code (only reached if `/404.html` were absent, which it never is).
- Consequence: every unknown URL (e.g. `/blog/does-not-exist`) returns 200 with the 404 page — crawlers treat every path as valid; SEO/soft-404 penalties; violates the plan's "404 present" intent.
- Fix:
  ```nginx
  error_page 404 /404.html;
  location / { try_files $uri $uri/ =404; }
  location ~* \.html$ { try_files $uri $uri/ =404; }
  ```
  (the `error_page` directive serves `404.html` with the correct 404 status).

### MEDIUM

**3. Container runs as root (no non-root user)**
- `Dockerfile` (whole file) — no `USER` directive; `CMD ["supervisord", ...]` runs as root (PID 1), the nginx master and the Fastify process (`node dist-server/server.js`) all run as root. `nginx.conf` `user nginx;` only drops nginx *worker* privileges; Fastify stays root and is the internet-facing (proxied) process.
- Fix: in the runtime stage add a non-root user and run supervisord under it (nginx `user` already set; ensure Fastify inherits it, and all bound ports ≥1024 so no CAP needed).

**4. Build-time dependencies bloat the runtime image**
- `package.json` — `pug`, `marked`, `highlight.js`, `isomorphic-dompurify`, `gray-matter` are in `dependencies`, not `devDependencies`. The runtime stage `Dockerfile:31` runs `npm ci --omit=dev`, which still installs all of them even though they are only used by `scripts/build.ts` at build time.
- Fix: move `gray-matter`, `marked`, `highlight.js`, `isomorphic-dompurify`, `pug` to `devDependencies` (plus `tsx`, `typescript`, `@types/node` already there). Keep only `fastify`, `@fastify/cors`, `hcaptcha`, `dotenv` as runtime deps.

**5. Unversioned images / fonts / favicon marked `immutable` (1 year)**
- `nginx.conf:81` (`location ~* \.(png|jpe?g|gif|webp|svg|woff2?|pdf)$`) and `nginx.conf:88` (`location = /favicon.svg`) both set `Cache-Control: public, max-age=31536000, immutable` on **non-content-addressed** paths.
- These files are *not* hashed, so any future change (e.g. refreshing the favicon — see §LOW #8) will **not reach returning visitors for up to 365 days**. `immutable` is only safe on content-addressed/hashed URLs.
- Fix: version them at build (`/favicon.svg?<hash>`, hashed `images/`) or drop `immutable` and use a shorter `max-age` (e.g. `public, max-age=86400` w/o `immutable`) for unhashed static files.

**6. CORS `origin: true` reflects any origin**
- `src/server.ts:12` — `app.register(cors, { origin: true });`
- `origin: true` mirrors the request's `Origin` header, effectively allowing cross-origin POSTs to `/api/contact` from *any* site (hCaptcha still gates them, but the reflection is an anti-pattern and widens the attack surface / enables CSRF-style probing).
- Fix: `origin: 'https://jordancolehunt.com'` (and the preview origin if needed), or a small allow-list.

**7. Hashed `script.js` is not served `immutable` (lives outside `/js/`)**
- `scripts/build.ts` HASHABLE emits `/script.<hash>.js` at the site root (`dist-site/script.*.js`, verified), but `nginx.conf:73` only matches `^/js/.+\.js$`. The hashed contact script therefore falls through to `location /` and is served `no-cache` instead of `immutable` — a hashed asset that is not actually cached as immutable.
- Fix: emit the hashed copy under `/js/` (e.g. `/js/script.<hash>.js`) or extend the nginx JS location to `^/(js/|script\.).+\.js$`.

### LOW

**8. `favicon.svg` still uses the old navy/cyan palette**
- `public/favicon.svg` — `fill="#0a192f"` / `stroke="#64ffda"`. Leftover from the pre-redesign palette (DESIGN_SPEC §1.3 calls for grey-white `#faf9f6`/`#353431`); also compounded by the `immutable` caching in §MEDIUM #5.

**9. `--text-2xl` CSS variable is undefined**
- `public/styles/components.css:393` — `font-size: var(--text-2xl);` but `main.css` only defines `--font-size-2xl: 1.625rem` (and `--text-*` vars from the spec don't include `--text-2xl`). The blog-post `<h1>` title falls back to inherited size instead of the intended `1.625rem`.
- Fix: change to `var(--font-size-2xl)`.

**10. README.md (and AGENTS.md) are stale / contradictory**
- `README.md` still documents NestJS ("Built with ❤️ using NestJS", "Why This Stack" → NestJS), Mailgun, Space Grotesk, and the navy `#0a192f` palette; `AGENTS.md` likewise describes the removed NestJS architecture. Plan task 9 asked for these to be updated. No runtime impact, but misleading for anyone onboarding/deploying.

**11. Contact email HTML is not escaped**
- `src/services/mail.ts:83-86` — `name`, `email`, `message` are interpolated directly into the HTML email body (`message.replace(/\n/g, '<br>')`). A message containing HTML could inject markup into the owner's inbox email. Low risk (sent only to the owner, not reflected), but escape these before embedding.

**12. `theme-color` meta stays light in dark mode until JS runs / empty toggle label**
- `views/layout.pug` hardcodes `<meta name="theme-color" content="#faf9f6">`; the no-flash inline script sets `data-theme` but does not update `theme-color`, so `app.js` (`syncThemeColor`) only corrects it after first paint (browser chrome flashes light in dark mode). The toggle button also ships with an empty `<span class="theme-toggle-label">` and only receives `LIGHT`/`DARK` text from `app.js`.

**13. Missing `content` submodule does not fail the build**
- `scripts/lib/blog.ts` `getAllPosts()` returns `[]` with a `console.warn` when `content/blog` is absent; `scripts/build.ts` then renders an empty blog index and still exits 0. PLAN.md §J explicitly calls for "build.ts fails with a clear error if content/blog is missing". If the `content` submodule isn't checked out on the Fly builder, the deployed site silently ships with **zero blog posts**.
- Fix: `process.exitCode = 1` / throw when `content/blog` is missing.

---

## Checklist (pass / fail per criterion)

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1a | Build works (`npm run build` exit 0) | ✅ PASS | Static + server compile clean; 8 pages + 6 posts + 7 hashed assets |
| 1b | All routes render | ✅ PASS | `/`, `/skills`, `/projects`, `/about`, `/contact`, `/cv`, `/blog`, `/blog/:slug`, `/404` |
| 1c | Blog posts included | ✅ PASS | 6 published posts rendered (2 `draft:true` correctly excluded) |
| 1d | 404 present | ⚠️ FAIL | `404.html` generated and referenced, but served with **HTTP 200** (issue #2) |
| 1e | Sitemap present | ✅ PASS | `sitemap.xml` + `robots.txt` emitted (lastmod = build time, not post date — minor) |
| 2a | Hashed, immutable CSS/JS | ⚠️ PARTIAL | CSS + `/js/*` hashed → `immutable` ✅; `script.js` hashed but served `no-cache` (#7) |
| 2b | Images/fonts immutable | ⚠️ PARTIAL | Correctly cached but **unhashed** `immutable` on version-fragile files (#5) |
| 2c | HTML no-cache + SWR (no accidental long-cache) | ✅ PASS | `no-cache` + `CDN-Cache-Control: ...stale-while-revalidate` on HTML/`/` |
| 2d | gzip + brotli | ✅ PASS | Both enabled, correct `gzip_types`/`brotli_types`, `gzip_vary on` |
| 2e | etag | ✅ PASS | `etag on;` in `http` block |
| 2f | API `no-store` | ✅ PASS | nginx `add_header Cache-Control "no-store..."` on `/api/` + Fastify `onSend` hook |
| 2g | No anti-patterns (immutable-on-HTML, hashing missing, ref mismatch) | ⚠️ FAIL | #5 (immutable on unversioned files), #7 (hashed asset not immutable); no Pug↔hash reference mismatch found |
| 3a | Blog XSS (DOMPurify) preserved | ✅ PASS | `marked` `hooks.postprocess` → DOMPurify whitelist retained (`ALLOWED_TAGS`/`ALLOWED_ATTR`, no data attrs) |
| 3b | Path traversal preserved | ✅ PASS | `validatePath` (normalize + relative containment) retained and called via `getPostBySlug` |
| 3c | Contact validation + hCaptcha | ✅ PASS | required-fields + email regex → 400; hCaptcha verify before send; no info leak |
| 3d | Secret handling (env, not hard-coded) | ✅ PASS | `ZOHO_*`/`HCAPTCHA_SECRET` via env/dotenv; only public values baked into HTML |
| 3e | nginx security headers | ✅ PASS | nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy; `server_tokens off` |
| 4a | Fonts (Departure Mono UI + Source Serif 4 body) | ✅ PASS | Self-hosted woff2, `@font-face` declared; no Google Fonts CDN |
| 4b | Grey-white light + dark theme, no-flash | ✅ PASS | `:root` day tokens, `html[data-theme=dark]`, inline `<head>` script before paint |
| 4c | Plain background, responsive | ✅ PASS | No dot/canvas; `--frame-inline` 75px → 24px @640px; max-width 760px |
| 4d | No leftover dots / Space Grotesk / navy | ⚠️ FAIL | `favicon.svg` still navy/cyan (#8); no dots/Space-Grotesk/GSAP/Lucide in CSS/JS/views |
| 5a | Dockerfile stages / size | ⚠️ PARTIAL | Multi-stage ✅, but runtime image bloated by build deps (#4) |
| 5b | Non-root | ❌ FAIL | Runs as root (#3) |
| 5c | Min machines / secrets | ✅ PASS | `min_machines_running = 0`, secrets via `fly secrets`, `[[vm]] shared-cpu-1x` |
| 5d | nginx + fastify wiring | ✅ PASS | nginx 8080 → static + proxy `/api`, `/healthz` → 127.0.0.1:3001 |
| 5e | Correct PORT (8080) / internal proxy (3001) | ✅ PASS | `internal_port 8080`, `PORTINT=3001`, Fastify binds 127.0.0.1 |
| 5f | `.dockerignore` correctness | ✅ PASS | Excludes node_modules/.git/dist; `!content/**/*.md` keeps blog content; fonts kept |
| 6 | NestJS fully removed | ✅ PASS | No `@nestjs/*` in `package.json`; `src/` = server + services only; controllers/module/main deleted; compiles without Nest |

## Overall verdict

**Conditionally approve.** The static-site/Nginx/Fastify architecture is implemented faithfully to
the plan: build succeeds, hashing + reference rewriting works, blog XSS/traversal guards are
preserved, caching is broadly correct, NestJS is fully removed, and the theme/design is close to
spec. However, two **high-severity** issues must be resolved before deploy — the empty hCaptcha
site key (contact form non-functional) and 404s returning HTTP 200. The medium issues (root user,
image bloat, `immutable` on unversioned assets, permissive CORS, the unhashed-script caching gap)
should be fixed in the same pass to meet the "best-practice caching" and "security" criteria this
review is strictly held to.

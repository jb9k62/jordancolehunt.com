# AGENTS.md

This file provides guidance to pi, the coding agent, when working with this repository.

## Commands

### Development
- `npm run dev` - Start development server with hot-reload on port 3000
- `npm run build` - Compile TypeScript backend to dist/
- `npm start` - Start production server (requires build first)

### Environment Setup
Requires Node.js v18 or higher.

Environment variables are configured in `.env`:
- `ZOHO_CLIENT_ID` - Zoho OAuth client ID
- `ZOHO_CLIENT_SECRET` - Zoho OAuth client secret
- `ZOHO_REFRESH_TOKEN` - Zoho OAuth refresh token (long-lived)
- `ZOHO_FROM_ADDRESS` - Sender email address (e.g., hi@jordancolehunt.com)
- `ZOHO_ACCOUNTS_URL` - Zoho accounts URL (defaults to https://accounts.zoho.com)
- `ZOHO_MAIL_URL` - Zoho mail API URL (defaults to https://mail.zoho.com)
- `HCAPTCHA_SECRET` - hCaptcha secret key for spam protection
- `PORT` - Server port (defaults to 3000)

## Architecture Overview

This is a personal website with a **NestJS/TypeScript backend** serving **Pug templates** with **vanilla JavaScript** for client-side interactions.

### Backend (NestJS + TypeScript)

**Entry Point:** `src/main.ts` configures the NestJS application with:
- Pug as the view engine
- CORS enabled
- Views directory at `views/`

**Module Structure:** `src/app.module.ts`
- `ServeStaticModule` serves files from `public/` at root
- API routes under `/api/*` are excluded from static serving
- Controllers: AppController (health check), PagesController (page routes), ContactController (API), BlogController (blog routes)
- Providers: MailService (Zoho Mail integration), HcaptchaService (spam protection), BlogService (blog post management)

**Controllers:**
- `PagesController` (`src/controllers/pages.controller.ts`) - Server-rendered routes using `@Render()` decorator, each returning page metadata (title, page, currentPath)
- `ContactController` (`src/controllers/contact.controller.ts`) - POST endpoint at `/api/contact` with validation, hCaptcha verification, and Zoho Mail integration
- `BlogController` (`src/controllers/blog.controller.ts`) - Blog routes with CDN-optimized caching: `/blog` (index), `/blog/:slug` (individual posts)
- `AppController` (`src/app.controller.ts`) - Health check endpoint

**Services:**
- `MailService` (`src/services/mail.service.ts`) - Handles email sending via Zoho Mail API with OAuth2 authentication
- `HcaptchaService` (`src/services/hcaptcha.service.ts`) - Verifies hCaptcha tokens for spam protection
- `BlogService` (`src/services/blog.service.ts`) - Manages blog posts: reads Markdown files, parses frontmatter, renders HTML with syntax highlighting, handles XSS sanitisation and path traversal protection

### Frontend (Pug + Vanilla JS + CSS)

**Template System:** Pug templates in `views/`
- `layout.pug` - Base layout with navigation, footer, and script imports (GSAP, transitions, app)
- Page-specific templates: `index.pug`, `skills.pug`, `projects.pug`, `about.pug`, `contact.pug`, `blog.pug` (blog index), `blog-post.pug` (individual posts)
- Mixins: `views/mixins/nav.pug`, `views/mixins/footer.pug`
- Each page receives `title`, `page`, and `currentPath` from controller
- Blog pages also receive `posts` (index) or `post` (individual) data

**Static Assets:** `public/`
- `js/transitions.js` - View Transitions API support detection and GSAP animation lifecycle
- `js/app.js` - Main application JavaScript (page-specific animations)
- `styles/main.css` - Core styles
- `styles/transitions.css` - View Transitions API styles
- `styles/components.css` - Component-specific styles

**Design System:**
- Color Palette: Deep Navy (#0a192f), Electric Cyan (#64ffda), Off-white (#ccd6f6)
- Typography: Space Grotesk (Google Fonts)
- Animations: GSAP for page transitions and effects
- View Transitions API: Modern cross-document transitions (Chrome 126+, Safari 18.2+)

### Build System

**NestJS CLI Configuration:** `nest-cli.json`
- `assets: ["public/**/*"]` copies public folder to dist/ during build
- `watchAssets: true` watches public folder in dev mode

**TypeScript Configuration:** `tsconfig.json`
- Compiles to CommonJS with ES2021 target
- Decorators enabled for NestJS
- Output to `dist/`

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
- NestJS copies `public/` to `dist/public/` during build
- Static files served from root path (`/`) except `/api/*` routes
- Views directory is outside dist, referenced as `../views` from compiled code

**Page Navigation:**
- Each page is a separate Pug template rendered server-side
- View Transitions API provides smooth page transitions (when supported)
- GSAP animations re-initialize on navigation (via pageshow event)

**Contact Form Flow:**
1. Client submits POST to `/api/contact` with name, email, message, and hCaptcha token
2. Controller validates fields and email format
3. HcaptchaService verifies the captcha token
4. MailService sends email via Zoho Mail API
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

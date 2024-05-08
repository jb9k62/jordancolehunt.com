# Personal Website

A modern personal website and blog built with **NestJS + TypeScript** backend, **Pug templates**, and **vanilla JavaScript/CSS** frontend.

## Architecture Decision

**Why TypeScript backend + Vanilla JS frontend?**
- ✅ **NestJS is designed for TypeScript** - clean decorators, type safety, maintainable code
- ✅ **Simple frontend doesn't need TypeScript** - vanilla JS keeps it fast and dependency-free
- ✅ **Best of both worlds** - use the right tool for each job

## Design Features

### Color Palette (Three Colors)
- **Deep Navy** (`#0a192f`) - Primary background
- **Electric Cyan** (`#64ffda`) - Accent color
- **Off-white** (`#ccd6f6`) - Text color

### Typography
- **Space Grotesk** - Modern geometric sans-serif font

### Design Principles
- ✨ Minimal, clean layout
- 🎯 Beautiful hover effects on all interactive elements
- 📱 Fully responsive design
- ⚡ Smooth animations and transitions

## Tech Stack

### Backend
- **NestJS** (TypeScript)
- **Express** (via NestJS)
- **Pug** - Template engine for server-side rendering
- **Mailgun** - Email service for contact form
- **Marked** - Markdown parsing with GitHub Flavored Markdown (GFM)
- **gray-matter** - YAML frontmatter parsing for blog posts
- **highlight.js** - Syntax highlighting for code blocks
- **isomorphic-dompurify** - XSS sanitisation

### Frontend
- **Pug Templates** - Server-side rendered views
- **CSS3** - Custom styling with CSS variables, organised into modules
- **Vanilla JavaScript** - No frameworks, no build step
- **GSAP** - Professional-grade animations
- **View Transitions API** - Modern cross-document transitions

## Project Structure

```
jordancolehunt.com/
├── src/                           # TypeScript source (backend)
│   ├── controllers/
│   │   ├── app.controller.ts      # Health check endpoint
│   │   ├── pages.controller.ts    # Server-rendered page routes
│   │   ├── contact.controller.ts  # Contact form API
│   │   └── blog.controller.ts     # Blog routes
│   ├── services/
│   │   ├── mail.service.ts        # Mailgun email service
│   │   └── blog.service.ts        # Blog post management
│   ├── app.module.ts              # Main NestJS module
│   └── main.ts                    # Application entry
├── views/                         # Pug templates
│   ├── layout.pug                 # Base layout
│   ├── index.pug                  # Home page
│   ├── skills.pug                 # Skills page
│   ├── projects.pug               # Projects page
│   ├── about.pug                  # About page
│   ├── contact.pug                # Contact page
│   ├── blog.pug                   # Blog index
│   ├── blog-post.pug              # Individual blog post
│   └── mixins/
│       ├── nav.pug                # Navigation component
│       └── footer.pug             # Footer component
├── public/                        # Static assets
│   ├── js/
│   │   ├── app.js                 # Main application JS
│   │   └── transitions.js         # View Transitions API support
│   └── styles/
│       ├── main.css               # Core styles
│       ├── transitions.css        # View transition styles
│       └── components.css         # Component-specific styles
├── content/
│   └── blog/                      # Markdown blog posts
├── dist/                          # Compiled output (git-ignored)
├── tsconfig.json                  # TypeScript configuration
├── nest-cli.json                  # NestJS CLI configuration
├── package.json
├── .env                           # Environment variables
└── CLAUDE.md                      # Development guidance
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Mailgun account (for contact form)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Create or update `.env` with your Mailgun credentials:
   ```env
   MAILGUN_API_KEY=your_api_key_here
   MAILGUN_DOMAIN=your_domain_here
   PORT=3000
   ```

3. **Start the server:**

   **Development mode** (with hot-reload):
   ```bash
   npm run dev
   ```

   **Production mode** (requires build first):
   ```bash
   npm run build
   npm start
   ```

4. **Visit the site:**
   ```
   http://localhost:3000
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server (requires build first) |
| `npm run start:prod` | Same as `npm start` |

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

### ✨ Backend Features
- **Server-Side Rendering** - Pug templates for dynamic page generation
- **Blog System** - Markdown-based blog with frontmatter support
- **Type Safety** - NestJS controllers and services with TypeScript
- **Email Service** - Contact form notifications via Mailgun
- **Security** - XSS sanitisation, path traversal protection
- **Performance** - CDN-optimised caching for blog posts
- **Syntax Highlighting** - Automatic code block highlighting with highlight.js
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
    --navy: #0a192f;
    --cyan: #64ffda;
    --off-white: #ccd6f6;
}
```

### Update Email Recipient

Edit `src/services/mail.service.ts`:
```typescript
to: 'your-email@example.com',
```

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

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set these on your hosting platform:
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `PORT` (optional, defaults to 3000)

### Start Production Server

```bash
npm run start:prod
```

The compiled code in `dist/` and static files in `public/` will be served.

## Development Notes

- **TypeScript compilation**: The `nest build` command compiles TypeScript to JavaScript in `dist/`
- **Static assets**: The `nest-cli.json` ensures `public/` folder is copied to `dist/public/`
- **Pug templates**: Views are in `views/` directory and remain outside `dist/`
- **Hot reload**: Development mode watches for file changes in both `src/` and `public/`
- **No frontend build**: JavaScript and CSS are served as-is, no webpack/bundler needed
- **View Transitions**: Requires modern browser support (Chrome 126+, Safari 18.2+)
- **GSAP animations**: Cleanup and re-initialisation on navigation prevents memory leaks
- **Blog posts**: Markdown files are parsed at request time with security protections

## Why This Stack?

1. **NestJS + TypeScript**: Industry-standard for Node.js backends with excellent developer experience
2. **Pug Templates**: Server-side rendering for SEO and performance, component reusability with mixins
3. **Vanilla Frontend**: No build step for client-side code keeps things fast and simple
4. **Markdown Blog**: Easy content management with frontmatter, syntax highlighting, and security built-in
5. **GSAP + View Transitions**: Professional animations with progressive enhancement
6. **Single Deployment**: Everything runs from one Node.js process
7. **Type Safety**: Where it matters (backend logic and services)
8. **Simplicity**: Where it matters (frontend doesn't need complex tooling)

## Blog System

The blog system supports:
- **Markdown with GFM**: GitHub Flavored Markdown for familiar syntax
- **Frontmatter**: YAML metadata for title, date, tags, and more
- **Syntax Highlighting**: Automatic code block highlighting with highlight.js
- **Pinned Posts**: Feature important posts at the top of the index
- **Security**: XSS sanitisation and path traversal protection
- **Performance**: CDN-optimised caching headers
- **SEO-Friendly**: Server-rendered HTML with metadata

---

Built with ❤️ using NestJS, TypeScript, Pug, and vanilla web technologies.

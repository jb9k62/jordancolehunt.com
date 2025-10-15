# Personal Website v2

A minimal, modern personal website built with **NestJS + TypeScript** backend and **vanilla JavaScript/HTML/CSS** frontend.

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
- **Mailgun** - Email service for contact form

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Vanilla JavaScript** - No frameworks, no build step

## Project Structure

```
v2/
├── src/                          # TypeScript source (backend)
│   ├── controllers/
│   │   └── contact.controller.ts # Contact form API
│   ├── services/
│   │   └── mail.service.ts       # Email service
│   ├── app.module.ts             # Main NestJS module
│   ├── app.controller.ts         # Health check endpoint
│   └── main.ts                   # Application entry
├── public/                       # Static frontend files
│   ├── index.html               # Main HTML
│   ├── styles.css               # All styling
│   └── script.js                # Client-side JS
├── dist/                        # Compiled output (git-ignored)
├── tsconfig.json                # TypeScript configuration
├── nest-cli.json                # NestJS CLI configuration
├── package.json
└── .env                         # Environment variables
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Mailgun account (for contact form)

### Installation

1. **Navigate to v2 directory:**
   ```bash
   cd v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Update `.env` with your Mailgun credentials:
   ```env
   MAILGUN_API_KEY=your_api_key_here
   MAILGUN_DOMAIN=your_domain_here
   PORT=3000
   ```

4. **Build the TypeScript backend:**
   ```bash
   npm run build
   ```

5. **Start the server:**

   **Development mode** (with hot-reload):
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

6. **Visit the site:**
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

## API Endpoints

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
- Type-safe NestJS controllers and services
- Static file serving for frontend
- Contact form email notifications via Mailgun
- Input validation
- Error handling
- Health check endpoint

### 🎨 Frontend Features
- Smooth scroll navigation
- Parallax hero effect
- Form validation
- Animated transitions
- Responsive layout
- No build step needed - pure vanilla JS

## Customization

### Update Personal Information

Edit `public/index.html`:
- Name and title in hero section
- About section text
- Technologies list
- Footer information

### Change Color Scheme

Modify CSS variables in `public/styles.css`:
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

- **TypeScript compilation**: The `nest build` command compiles TypeScript to JavaScript
- **Static assets**: The `nest-cli.json` ensures `public/` folder is copied to `dist/`
- **Hot reload**: Development mode watches for file changes
- **No frontend build**: HTML/CSS/JS are served as-is, no webpack/bundler needed

## Why This Stack?

1. **NestJS + TypeScript**: Industry-standard for Node.js backends, excellent DX
2. **Vanilla Frontend**: Keeps things simple, fast, and dependency-free
3. **Single Deployment**: Everything runs from one Node.js process
4. **Type Safety**: Where it matters (backend logic)
5. **Simplicity**: Where it matters (frontend doesn't need complex tooling)

---

Built with ❤️ using NestJS, TypeScript, and vanilla web technologies.

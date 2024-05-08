# ===================================
# Stage 1: Builder
# ===================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and views
COPY . .

# Build the NestJS application
# This compiles TypeScript to dist/ and copies public/ to dist/public/
RUN npm run build

# ===================================
# Stage 2: Production
# ===================================
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy views directory (referenced by NestJS at runtime)
COPY --from=builder --chown=nestjs:nodejs /app/views ./views

# Copy public directory for static assets (ServeStaticModule expects it at root level)
COPY --from=builder --chown=nestjs:nodejs /app/public ./public

# Copy content directory for blog posts (BlogService reads Markdown from here)
COPY --from=builder --chown=nestjs:nodejs /app/content ./content

# Set environment variable for port (Fly.io standard)
ENV PORT=8080 \
    NODE_ENV=production

# Expose port
EXPOSE 8080

# Switch to non-root user
USER nestjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main"]

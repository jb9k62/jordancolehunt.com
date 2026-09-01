# ============================================================================
# Stage 1: builder — compile static site (dist-site) + Fastify server (dist-server)
# ============================================================================
FROM node:20-alpine AS builder

# Public build-time values baked into static HTML (not secrets)
ARG GITHUB_USERNAME=jb9k62
ARG HCAPTCHA_SITE_KEY=
ARG BASE_URL=https://jordancolehunt.com
ENV GITHUB_USERNAME=${GITHUB_USERNAME} \
    HCAPTCHA_SITE_KEY=${HCAPTCHA_SITE_KEY} \
    BASE_URL=${BASE_URL}

WORKDIR /app

# Install dependencies (including devDeps: tsx, typescript)
COPY package*.json ./
RUN npm ci

# Copy the whole repo (content submodule + public fonts are included)
COPY . .

# Build the static site + compile the Fastify server
RUN npm run build

# ============================================================================
# Stage 2: runtime — Nginx (ingress on 8080) + Fastify (127.0.0.1:3001)
# ============================================================================
FROM node:20-alpine

RUN apk add --no-cache nginx nginx-mod-http-brotli supervisor

# Non-root user for the runtime (nginx master, Fastify, supervisor)
RUN addgroup -S app && adduser -S -G app -u 1001 app

WORKDIR /app

# Runtime deps only (fastify, @fastify/cors, hcaptcha, dotenv)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Built artifacts
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/dist-site  ./dist-site

# Runtime config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf
COPY supervisord.conf /etc/supervisord.conf

# Give the non-root user ownership of the app + writable config + nginx runtime dirs
RUN chown -R app:app /app && \
    chown app:app /etc/nginx/nginx.conf /etc/nginx/security-headers.conf && \
    mkdir -p /var/lib/nginx /var/cache/nginx /var/log/nginx /tmp/nginx && \
    chown -R app:app /var/lib/nginx /var/cache/nginx /var/log/nginx /tmp /tmp/nginx && \
    chmod 1777 /tmp

# Drop privileges: supervisor (PID 1) and everything it spawns run as 'app'
USER app

ENV NODE_ENV=production \
    PORTINT=3001

EXPOSE 8080

CMD ["supervisord", "-c", "/etc/supervisord.conf"]

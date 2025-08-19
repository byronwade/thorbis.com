# ================================
# PRODUCTION DOCKERFILE - SECURITY HARDENED
# Next.js Application with Supabase Integration
# ================================

# ================================
# Stage 1: Dependencies Installation
# ================================
FROM node:20-alpine AS deps

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory with restricted permissions
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY package-lock.json* ./

# Install Bun for faster package management
RUN npm install -g bun@latest

# Install dependencies with exact versions (no cache for security)
RUN bun install --frozen-lockfile --production=false

# ================================
# Stage 2: Build Application
# ================================
FROM node:20-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Install Bun
RUN npm install -g bun@latest

# Set build environment variables (no secrets here)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN bun run build

# ================================
# Stage 3: Production Runtime (Security Hardened)
# ================================
FROM node:20-alpine AS runner

# Install security updates and minimal runtime dependencies
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/* \
    && npm install -g bun@latest

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Set secure working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Security: Don't run as root
USER nextjs

# Copy built application with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Make files read-only
USER root
RUN find /app -type f -exec chmod 444 {} \; && \
    find /app -type d -exec chmod 555 {} \; && \
    chmod 755 /app

# Switch back to non-root user
USER nextjs

# Expose port (non-privileged)
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Security: Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

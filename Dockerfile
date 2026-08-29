# Multi-stage Production Dockerfile for SewerBITA (Vite React SPA)

# Stage 1: Build Environment
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package descriptors and install clean dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy full application codebase and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Nginx Web Server
FROM nginx:alpine AS production-stage

# Copy custom Nginx SPA & Health Check configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built production assets from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose ports 80, 3000, and 3005 for Coolify / Traefik Reverse Proxy
EXPOSE 80 3000 3005

# Health check specification for Coolify PaaS monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3005/health || wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Launch Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]

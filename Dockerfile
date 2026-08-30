# Multi-stage Production Dockerfile for SewerBITA (Unified React SPA + Express PostgreSQL REST API)

# Stage 1: Build React Frontend
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Unified Node.js Server
FROM node:20-alpine AS production-stage
WORKDIR /app

# Copy server package descriptors and install clean dependencies
COPY server/package.json ./server/package.json
RUN npm install --prefix server --omit=dev

# Copy built frontend assets to /app/dist
COPY --from=build-stage /app/dist /app/dist

# Copy backend server code and database schema
COPY server /app/server

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

# Expose ports for Coolify / Traefik Reverse Proxy
EXPOSE 3000 80 3005

# Healthcheck targeting /health and /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Launch Express server which handles both REST API and SPA static assets
CMD ["node", "server/server.js"]


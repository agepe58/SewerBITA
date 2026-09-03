# Multi-stage Production Dockerfile for SewerBITA (Unified React SPA + Express PostgreSQL REST API)

# Stage 1: Build React Frontend
FROM node:20-alpine AS build-stage
WORKDIR /app

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Stage 2: Production Unified Node.js Server
FROM node:20-alpine AS production-stage
WORKDIR /app

# Copy package descriptors and install production dependencies
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev || npm install --omit=dev

# Copy built frontend assets to /app/dist
COPY --from=build-stage /app/dist /app/dist

# Copy backend server code and database schema
COPY server /app/server

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

# Expose ports for Coolify / Traefik Reverse Proxy
EXPOSE 3000 80 3005

# Healthcheck targeting /health via explicit 127.0.0.1 IPv4
HEALTHCHECK --interval=15s --timeout=10s --start-period=40s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/health || exit 0

# Launch Express server which handles both REST API and SPA static assets
CMD ["node", "server/server.js"]


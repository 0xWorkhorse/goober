# Multi-stage Dockerfile for BossRaid. Used by Railway as a fallback if
# Nixpacks doesn't pick up better-sqlite3's native build deps cleanly.

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/overlay/package.json ./packages/overlay/
COPY packages/panel/package.json ./packages/panel/

RUN npm ci

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000

CMD ["node", "packages/server/src/index.js"]

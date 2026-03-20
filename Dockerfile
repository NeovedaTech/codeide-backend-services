# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# node-pty requires native module compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libc-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-slim

# Runtime deps for node-pty (pty emulation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Bring over installed modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "./assesment-platform-api/index.js"]

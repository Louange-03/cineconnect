FROM node:20-slim

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Install workspace dependencies (backend + root scripts)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Cloud Run injects PORT automatically (default 8080)
ENV PORT=8080
ENV NODE_ENV=production

# Start backend API
CMD ["pnpm", "--dir", "backend", "start"]

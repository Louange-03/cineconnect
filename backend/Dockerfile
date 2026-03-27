FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Install backend dependencies first for better layer caching.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "start"]

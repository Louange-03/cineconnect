FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ARG VITE_SOCKET_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

RUN pnpm build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]

FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Coolify met parfois :8080 dans l’URL (port conteneur) ; le navigateur doit appeler le proxy (:80 / :443).
RUN export VITE_API_URL=$(printf '%s' "${VITE_API_URL}" | sed -E 's/:8080\/?$//') && \
    export VITE_SOCKET_URL=$(printf '%s' "${VITE_SOCKET_URL}" | sed -E 's/:8080\/?$//') && \
    pnpm build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]

# Etapes finales :
#   - Par defaut (derniere etape) : Node + serve sur 8080 — local, Cloud Run, docker-compose.yml
#   - target: coolify : nginx sur 8080 — docker-compose.yaml / Coolify (domaine web …:8080 comme l’API)
#
# Build Coolify : docker compose -f docker-compose.yaml build web  (compose definit target: coolify)

FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ARG VITE_SOCKET_URL

RUN export VITE_API_URL=$(printf '%s' "${VITE_API_URL}" | sed -E 's/:8080\/?$//') && \
    export VITE_SOCKET_URL=$(printf '%s' "${VITE_SOCKET_URL}" | sed -E 's/:8080\/?$//') && \
    pnpm build

FROM nginx:alpine AS coolify

COPY nginx-docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]

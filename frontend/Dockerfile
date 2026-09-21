# --- Stage 1: build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Зеркала
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
# ENV NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
ENV NPM_CONFIG_FETCH_TIMEOUT=60000
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN test -n "$VITE_API_BASE" || (echo "VITE_API_BASE is not set" && exit 1)

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# --- Stage 2: nginx ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
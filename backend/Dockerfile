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

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate
# RUN npx prisma generate

RUN npm run build

# --- Stage 2: prod ---
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/prisma.config.ts ./

COPY --from=builder /app/src/generated ./dist/generated

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/index.js"]
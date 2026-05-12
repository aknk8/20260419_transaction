# Stage 1: フロントエンドのビルド
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: 本番イメージ
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY scripts ./scripts
COPY src ./src
EXPOSE 3000
CMD ["node", "server/index.js"]

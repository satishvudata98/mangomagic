FROM node:20-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./server/
COPY --from=builder /app/client/dist ./public
ENV NODE_ENV=production
EXPOSE 10000
CMD ["node", "server/index.js"]

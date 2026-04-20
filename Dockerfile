FROM node:20-alpine AS root-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS web-deps
WORKDIR /app/mangomagic-next
COPY mangomagic-next/package*.json ./
RUN npm ci

FROM node:20-alpine AS web-builder
WORKDIR /app
COPY mangomagic-next ./mangomagic-next
COPY --from=web-deps /app/mangomagic-next/node_modules ./mangomagic-next/node_modules
RUN npm run build --prefix mangomagic-next

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=root-deps /app/node_modules ./node_modules
COPY server/ ./server/
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY mangomagic-next/ ./mangomagic-next/
COPY --from=web-deps /app/mangomagic-next/node_modules ./mangomagic-next/node_modules
COPY --from=web-builder /app/mangomagic-next/.next ./mangomagic-next/.next
EXPOSE 3000 10000
CMD ["npm", "run", "start"]

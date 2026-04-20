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
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:10000
ARG NEXT_PUBLIC_FIREBASE_API_KEY=
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
ARG NEXT_PUBLIC_FIREBASE_APP_ID=
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
COPY mangomagic-next ./mangomagic-next
COPY --from=web-deps /app/mangomagic-next/node_modules ./mangomagic-next/node_modules
RUN npm run build --prefix mangomagic-next

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S mangomagic && adduser -S mangomagic -G mangomagic
COPY --chown=mangomagic:mangomagic package*.json ./
COPY --chown=mangomagic:mangomagic --from=root-deps /app/node_modules ./node_modules
COPY --chown=mangomagic:mangomagic server/ ./server/
COPY --chown=mangomagic:mangomagic --from=server-deps /app/server/node_modules ./server/node_modules
COPY --chown=mangomagic:mangomagic mangomagic-next/ ./mangomagic-next/
COPY --chown=mangomagic:mangomagic --from=web-deps /app/mangomagic-next/node_modules ./mangomagic-next/node_modules
COPY --chown=mangomagic:mangomagic --from=web-builder /app/mangomagic-next/.next ./mangomagic-next/.next
USER mangomagic
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget -qO- http://127.0.0.1:10000/api/health || exit 1
CMD ["npm", "run", "start"]

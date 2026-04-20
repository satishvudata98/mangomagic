FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS web-deps
WORKDIR /app/mangomagic-next
COPY mangomagic-next/package*.json ./
RUN npm ci

FROM node:20-alpine AS web-builder
WORKDIR /app/mangomagic-next
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
COPY mangomagic-next ./
COPY --from=web-deps /app/mangomagic-next/node_modules ./node_modules
RUN npm run build && if [ -d public ]; then cp -R public .next/standalone/public; fi

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init && addgroup -S mangomagic && adduser -S mangomagic -G mangomagic
COPY --chown=mangomagic:mangomagic server/ ./server/
COPY --chown=mangomagic:mangomagic --from=server-deps /app/server/node_modules ./server/node_modules
COPY --chown=mangomagic:mangomagic --from=web-builder /app/mangomagic-next/.next/standalone ./web/
COPY --chown=mangomagic:mangomagic --from=web-builder /app/mangomagic-next/.next/static ./web/.next/static
COPY --chown=mangomagic:mangomagic deploy/start.mjs ./deploy/start.mjs
USER mangomagic
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD wget -qO- "http://127.0.0.1:10000/api/health?full=1" >/dev/null || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "deploy/start.mjs"]

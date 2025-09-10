FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && npm ci --omit=dev \
  && apt-get purge -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 5000
CMD ["node", "app.js"]

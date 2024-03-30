FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ENV NODE_ENV=production

ARG SOKETI_DEFAULT_APP_ID
ENV SOKETI_DEFAULT_APP_ID=$SOKETI_DEFAULT_APP_ID

ARG SOKETI_DEFAULT_APP_SECRET
ENV SOKETI_DEFAULT_APP_SECRET=$SOKETI_DEFAULT_APP_SECRET

ARG SOKETI_DEFAULT_APP_KEY
ENV SOKETI_DEFAULT_APP_KEY=$SOKETI_DEFAULT_APP_KEY

ARG SOKETI_DEFAULT_APP_CLUSTER
ENV SOKETI_DEFAULT_APP_CLUSTER=$SOKETI_DEFAULT_APP_CLUSTER

ARG NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY

ARG NEXT_PUBLIC_SOKETI_URL
ENV NEXT_PUBLIC_SOKETI_URL=$NEXT_PUBLIC_SOKETI_URL

ARG NEXT_PUBLIC_SOKETI_PORT
ENV NEXT_PUBLIC_SOKETI_PORT=$NEXT_PUBLIC_SOKETI_PORT

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ARG DISCORD_CLIENT_ID
ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID

ARG DISCORD_CLIENT_SECRET
ENV DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET

RUN npm run postinstall && npm run build
FROM base AS runner
WORKDIR /app



RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME="0.0.0.0"
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
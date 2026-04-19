FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Pass them via --build-arg when running docker build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG DATABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG LLM_BASE_URL
ARG LLM_MODEL
ARG LLM_API_KEY
ARG HF_EMBEDDING_MODEL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV LLM_BASE_URL=$LLM_BASE_URL
ENV LLM_MODEL=$LLM_MODEL
ENV LLM_API_KEY=$LLM_API_KEY
ENV HF_EMBEDDING_MODEL=$HF_EMBEDDING_MODEL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ใช้ Bun official image สำหรับ Alpine Linux
FROM oven/bun:1-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# Do not copy bun.lock here to avoid OS-mismatch with Next.js SWC bindings
COPY package.json ./
RUN bun install

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -f package-lock.json bun.lockb bun.lock

ENV NEXT_TELEMETRY_DISABLED 1

# ลบ package-lock.json เพื่อป้องกันความสับสน
RUN rm -f package-lock.json

# Build application (เนื่องจากตั้งค่า output: 'standalone' ใน next.config.js แล้ว)
RUN bun run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV BUN_SILENCE_ASYNC_HOOKS_WARNING=1

# สร้าง User ใหม่เพื่อไม่ให้รันด้วยสิทธิ์ root (Security Best Practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size (Next.js Standalone Mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# สลับไปใช้ nextjs user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000

# รัน server.js ที่ได้จากการ build แบบ standalone
ENTRYPOINT ["bun", "server.js"]

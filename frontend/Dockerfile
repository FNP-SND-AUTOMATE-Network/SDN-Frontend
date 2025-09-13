# ใช้ Bun official image สำหรับ Alpine Linux
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies stage
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Prerelease stage for build
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /app/.next ./.next
COPY --from=prerelease /app/public ./public
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/next.config.js ./next.config.js

# Expose port
EXPOSE 3000/tcp

# Set environment to production
ENV NODE_ENV=production
ENV BUN_SILENCE_ASYNC_HOOKS_WARNING=1

# Run the application
ENTRYPOINT ["bun", "start"]

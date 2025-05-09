FROM oven/bun:canary-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .

FROM oven/bun:canary-alpine AS runner
RUN apk add --no-cache curl
COPY package.json bun.lock ./
RUN bun install --production
COPY --from=builder /app .
RUN chown -R bun:bun /home/bun
USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "bot" ]
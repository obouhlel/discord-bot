FROM oven/bun:canary-alpine AS builder

WORKDIR /app

COPY package.json .
COPY bun.lock .
COPY tsconfig.json .
COPY prisma ./prisma

RUN bun install
RUN bun generate

COPY src ./src


FROM oven/bun:canary-alpine AS runner

RUN apk add --no-cache curl

COPY package.json .
COPY bun.lock .
COPY tsconfig.json .

RUN bun install --production

COPY ./data ./data
COPY --from=builder /app .

RUN chown -R bun:bun /home/bun

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "server" ]
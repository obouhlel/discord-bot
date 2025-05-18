# Discord Bot

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-5865F2?style=flat&logo=discord&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

This project is a Discord bot built with [Bun](https://bun.sh/), [TypeScript](https://www.typescriptlang.org/), and [discord.js](https://discord.js.org/). It also uses [Fastify](https://www.fastify.io/) for the HTTP server and [Prisma](https://www.prisma.io/) as the ORM.

## Features

- Discord bot using discord.js v14
- Fastify HTTP server
- Prisma ORM for database access
- Redis integration
- HuggingFace API integration
- Docker and Docker Compose support for development and production
- **Deployment on [Coolify](https://coolify.obouhlel.xyz)**

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Node.js (for some tooling)
- A Discord bot token and application credentials

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/obouhlel/discord-bot.git
   cd discord-bot
   ```

2. Copy the example environment file and fill in your credentials:

   ```sh
   cp .env.example .env
   # Edit .env with your values
   ```

3. Install dependencies:

   ```sh
   bun install
   ```

4. Generate Prisma client:

   ```sh
   bun run generate
   ```

### Development

To start the development environment (with hot reload and Dockerized services):

```sh
bun run dev
```

This will start the database and Redis containers, then run the bot with hot reloading.

### Production

To build and run the bot in production:

```sh
docker compose up --build
```

### Deployment on Coolify

The `docker-compose.yml` file is configured for deployment on [Coolify](https://coolify.io/).  
The bot is hosted and managed on Coolify using this configuration.

### Useful Commands

- `bun run lint` — Lint the codebase
- `bun run format` — Format the codebase
- `bun run migrate:dev` — Run Prisma migrations in development
- `bun run migrate:prod` — Run Prisma migrations in production

### Environment Variables

See `.env.example` for all required environment variables.

## License

This project is open source.

declare module "bun" {
  interface Env {
    NODE_ENV?: string;
    USERNAME: string; // ça prend le username du User windows sur windows (pas celui du .env)
    PASSWORD: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    DISCORD_TOKEN: string;
    REDIRECT_URI: string;
    COOKIE_SECRET: string;
    REDIS_URL: string;
    DATABASE_URL: string;
    FRONT_URL: string;
  }
}

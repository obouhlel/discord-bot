declare module "bun" {
  interface Env {
    NODE_ENV?: string;
    USERNAME: string;
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

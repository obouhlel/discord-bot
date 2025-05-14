declare module "bun" {
  interface Env {
    NODE_ENV?: string;
    USERNAME: string;
    PASSWORD: string;
    CLIENT_ID: string;
    DISCORD_TOKEN: string;
    REDIS_URL: string;
    LLM_TOKEN: string;
    DATABASE_URL: string;
  }
}

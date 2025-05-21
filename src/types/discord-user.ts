export interface DiscordUser {
  id: string;
  global_name: string;
  username: string;
  avatar: string;
  locale: string;
  email: string;
  verified: boolean;
  mfa_enabled: boolean;
}

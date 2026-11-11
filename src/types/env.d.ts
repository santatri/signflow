// Secrets (jamais dans wrangler.jsonc) : `.dev.vars` en local, `wrangler secret put` en production.
interface CloudflareEnv {
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
}

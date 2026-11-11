// Secrets (jamais dans wrangler.jsonc) : `.dev.vars` en local, `wrangler secret put` en production.
interface CloudflareEnv {
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  B2_ENDPOINT?: string;
  B2_REGION?: string;
  B2_BUCKET?: string;
  B2_KEY_ID?: string;
  B2_APPLICATION_KEY?: string;
}

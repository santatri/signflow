import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Configuration minimale : pas de cache incrémental R2 pour l'instant.
// Le bucket R2 "FILES" est réservé aux documents (jamais au cache applicatif).
export default defineCloudflareConfig();

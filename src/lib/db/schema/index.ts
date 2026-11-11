import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sessions_token_hash_unique").on(t.tokenHash), index("sessions_user_idx").on(t.userId)],
);

export const guestSessions = sqliteTable(
  "guest_sessions",
  {
    id: id(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("guest_sessions_token_hash_unique").on(t.tokenHash)],
);

export const documents = sqliteTable(
  "documents",
  {
    id: id(),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),
    guestSessionId: text("guest_session_id").references(() => guestSessions.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    originalKey: text("original_key").notNull(),
    signedKey: text("signed_key"),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    status: text("status", { enum: ["uploaded", "pending", "signed", "archived"] }).notNull().default("uploaded"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("documents_owner_idx").on(t.ownerId),
    index("documents_guest_idx").on(t.guestSessionId),
    index("documents_status_idx").on(t.status),
    uniqueIndex("documents_original_key_unique").on(t.originalKey),
  ],
);

export const documentVersions = sqliteTable(
  "document_versions",
  {
    id: id(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    fileKey: text("file_key").notNull(),
    sha256: text("sha256").notNull(),
    versionNumber: integer("version_number").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("document_versions_doc_version_unique").on(t.documentId, t.versionNumber)],
);

export const signatures = sqliteTable(
  "signatures",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestSessionId: text("guest_session_id").references(() => guestSessions.id, { onDelete: "cascade" }),
    imageKey: text("image_key").notNull(),
    type: text("type", { enum: ["drawn", "typed", "image"] }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("signatures_user_idx").on(t.userId), index("signatures_guest_idx").on(t.guestSessionId)],
);

export const signingRequests = sqliteTable(
  "signing_requests",
  {
    id: id(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["draft", "sent", "completed", "cancelled", "expired"] }).notNull().default("draft"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("signing_requests_document_idx").on(t.documentId)],
);

export const signers = sqliteTable(
  "signers",
  {
    id: id(),
    requestId: text("request_id").notNull().references(() => signingRequests.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    status: text("status", { enum: ["pending", "viewed", "signed", "declined"] }).notNull().default("pending"),
    signingOrder: integer("signing_order").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("signers_request_email_unique").on(t.requestId, t.email), index("signers_email_idx").on(t.email)],
);

export const signatureFields = sqliteTable(
  "signature_fields",
  {
    id: id(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    signerId: text("signer_id").references(() => signers.id, { onDelete: "set null" }),
    page: integer("page").notNull(),
    x: real("x").notNull(),
    y: real("y").notNull(),
    width: real("width").notNull(),
    height: real("height").notNull(),
    type: text("type", { enum: ["signature", "initials", "date", "text"] }).notNull().default("signature"),
  },
  (t) => [index("signature_fields_document_idx").on(t.documentId)],
);

export const signingEvents = sqliteTable(
  "signing_events",
  {
    id: id(),
    requestId: text("request_id").notNull().references(() => signingRequests.id, { onDelete: "cascade" }),
    signerId: text("signer_id").references(() => signers.id, { onDelete: "set null" }),
    eventType: text("event_type").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("signing_events_request_idx").on(t.requestId)],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    actorId: text("actor_id"),
    documentId: text("document_id"),
    action: text("action").notNull(),
    // Métadonnées techniques (jamais de secrets), texte JSON sérialisé.
    metadata: text("metadata"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_logs_actor_idx").on(t.actorId), index("audit_logs_document_idx").on(t.documentId)],
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    type: text("type", { enum: ["email_verification", "password_reset"] }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("verification_tokens_hash_unique").on(t.tokenHash), index("verification_tokens_user_idx").on(t.userId)],
);

export const usageRecords = sqliteTable(
  "usage_records",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [index("usage_records_user_idx").on(t.userId)],
);

export const appSettings = sqliteTable(
  "app_settings",
  {
    id: id(),
    settingKey: text("setting_key").notNull(),
    settingValue: text("setting_value").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("app_settings_key_unique").on(t.settingKey)],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  documents: many(documents),
  signatures: many(signatures),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
  versions: many(documentVersions),
  requests: many(signingRequests),
  fields: many(signatureFields),
}));

export const signingRequestsRelations = relations(signingRequests, ({ one, many }) => ({
  document: one(documents, { fields: [signingRequests.documentId], references: [documents.id] }),
  signers: many(signers),
  events: many(signingEvents),
}));

export const signersRelations = relations(signers, ({ one }) => ({
  request: one(signingRequests, { fields: [signers.requestId], references: [signingRequests.id] }),
}));

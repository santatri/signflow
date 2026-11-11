CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_key_unique` ON `app_settings` (`setting_key`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`document_id` text,
	`action` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_document_idx` ON `audit_logs` (`document_id`);--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`file_key` text NOT NULL,
	`sha256` text NOT NULL,
	`version_number` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_versions_doc_version_unique` ON `document_versions` (`document_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`guest_session_id` text,
	`title` text NOT NULL,
	`original_key` text NOT NULL,
	`signed_key` text,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_session_id`) REFERENCES `guest_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `documents_owner_idx` ON `documents` (`owner_id`);--> statement-breakpoint
CREATE INDEX `documents_guest_idx` ON `documents` (`guest_session_id`);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `documents_original_key_unique` ON `documents` (`original_key`);--> statement-breakpoint
CREATE TABLE `guest_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_sessions_token_hash_unique` ON `guest_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `signature_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`signer_id` text,
	`page` integer NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	`type` text DEFAULT 'signature' NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`signer_id`) REFERENCES `signers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `signature_fields_document_idx` ON `signature_fields` (`document_id`);--> statement-breakpoint
CREATE TABLE `signatures` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`guest_session_id` text,
	`image_key` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_session_id`) REFERENCES `guest_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `signatures_user_idx` ON `signatures` (`user_id`);--> statement-breakpoint
CREATE INDEX `signatures_guest_idx` ON `signatures` (`guest_session_id`);--> statement-breakpoint
CREATE TABLE `signers` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`signing_order` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `signing_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `signers_request_email_unique` ON `signers` (`request_id`,`email`);--> statement-breakpoint
CREATE INDEX `signers_email_idx` ON `signers` (`email`);--> statement-breakpoint
CREATE TABLE `signing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`signer_id` text,
	`event_type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `signing_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`signer_id`) REFERENCES `signers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `signing_events_request_idx` ON `signing_events` (`request_id`);--> statement-breakpoint
CREATE TABLE `signing_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `signing_requests_document_idx` ON `signing_requests` (`document_id`);--> statement-breakpoint
CREATE TABLE `usage_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `usage_records_user_idx` ON `usage_records` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`email_verified_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_tokens_hash_unique` ON `verification_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `verification_tokens_user_idx` ON `verification_tokens` (`user_id`);
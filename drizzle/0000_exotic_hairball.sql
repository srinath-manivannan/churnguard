CREATE TABLE `campaign_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`message_type` text NOT NULL,
	`personalized_content` text,
	`status` text DEFAULT 'pending',
	`message_id` text,
	`sent_at` integer,
	`delivered_at` integer,
	`opened_at` integer,
	`clicked_at` integer,
	`error_message` text,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'draft',
	`target_filter` text,
	`email_subject` text,
	`email_template` text,
	`sms_template` text,
	`sent_count` integer DEFAULT 0,
	`delivered_count` integer DEFAULT 0,
	`opened_count` integer DEFAULT 0,
	`clicked_count` integer DEFAULT 0,
	`converted_count` integer DEFAULT 0,
	`scheduled_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_message` text NOT NULL,
	`ai_response` text NOT NULL,
	`context_used` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `customer_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`event_type` text NOT NULL,
	`event_data` text,
	`occurred_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`external_id` text,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`company` text,
	`segment` text,
	`last_activity_date` text,
	`total_revenue` real DEFAULT 0,
	`support_tickets` integer DEFAULT 0,
	`churn_score` real DEFAULT 0,
	`risk_level` text DEFAULT 'low',
	`risk_factors` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `file_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`filename` text NOT NULL,
	`file_type` text,
	`file_size_bytes` integer,
	`status` text DEFAULT 'pending',
	`records_imported` integer DEFAULT 0,
	`records_failed` integer DEFAULT 0,
	`validation_results` text,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`processed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `image_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`google_drive_file_id` text,
	`filename` text NOT NULL,
	`mime_type` text,
	`file_size` integer,
	`exif_data` text,
	`analysis` text,
	`uploaded_at` integer,
	`analyzed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`report_type` text NOT NULL,
	`title` text NOT NULL,
	`html_content` text,
	`report_data` text,
	`start_date` integer,
	`end_date` integer,
	`email_sent` integer DEFAULT 0,
	`email_sent_at` integer,
	`generated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
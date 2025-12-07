CREATE TABLE `campaign_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`sent_at` integer,
	`delivered_at` integer,
	`opened_at` integer,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `campaigns` ADD `subject` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `content` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `recipient_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `sent_at` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `status` text DEFAULT 'active';
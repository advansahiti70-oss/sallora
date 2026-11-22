CREATE TABLE `access_windows` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`kind` text NOT NULL,
	`granted_by` integer,
	`starts_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ends_at` integer NOT NULL,
	`closed_at` integer,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "access_windows_kind_check" CHECK("access_windows"."kind" in ('setup', 'support')),
	CONSTRAINT "access_windows_length_check" CHECK("access_windows"."ends_at" > "access_windows"."starts_at" and "access_windows"."ends_at" - "access_windows"."starts_at" <= case "access_windows"."kind" when 'setup' then 259200 else 86400 end)
);
--> statement-breakpoint
CREATE INDEX `access_windows_venue_idx` ON `access_windows` (`venue_id`,`ends_at`);--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`table_id` integer NOT NULL,
	`kind` text NOT NULL,
	`opened_at` integer DEFAULT (unixepoch()) NOT NULL,
	`escalated_at` integer,
	`resolved_at` integer,
	`resolution` text,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`table_id`) REFERENCES `dining_tables`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "alerts_kind_check" CHECK("alerts"."kind" in ('waiting', 'needs_clearing')),
	CONSTRAINT "alerts_resolution_value_check" CHECK("alerts"."resolution" in ('tap', 'seen', 'expired')),
	CONSTRAINT "alerts_resolution_check" CHECK(("alerts"."resolved_at" is null) = ("alerts"."resolution" is null))
);
--> statement-breakpoint
CREATE INDEX `alerts_venue_opened_idx` ON `alerts` (`venue_id`,`opened_at`);--> statement-breakpoint
CREATE INDEX `alerts_table_opened_idx` ON `alerts` (`table_id`,`opened_at`);--> statement-breakpoint
CREATE TABLE `boxes` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer,
	`serial` text NOT NULL,
	`token_hash` text,
	`software_version` text,
	`last_seen_at` integer,
	`installed_at` integer,
	`returned_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `boxes_serial_unique` ON `boxes` (`serial`);--> statement-breakpoint
CREATE UNIQUE INDEX `boxes_token_hash_unique` ON `boxes` (`token_hash`);--> statement-breakpoint
CREATE INDEX `boxes_venue_idx` ON `boxes` (`venue_id`);--> statement-breakpoint
CREATE TABLE `cameras` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`box_id` integer,
	`name` text NOT NULL,
	`last_frame_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cameras_venue_name_idx` ON `cameras` (`venue_id`,`name`);--> statement-breakpoint
CREATE TABLE `consents` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`user_id` integer,
	`kind` text NOT NULL,
	`version` text NOT NULL,
	`accepted_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "consents_kind_check" CHECK("consents"."kind" in ('terms', 'data_processing', 'privacy_checklist'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consents_venue_kind_version_idx` ON `consents` (`venue_id`,`kind`,`version`);--> statement-breakpoint
CREATE TABLE `dining_tables` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`section_id` integer,
	`number` integer NOT NULL,
	`marked_as` text,
	`state` text DEFAULT 'free' NOT NULL,
	`state_since` integer,
	`last_visit_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "dining_tables_number_check" CHECK("dining_tables"."number" between 1 and 999),
	CONSTRAINT "dining_tables_marked_as_check" CHECK("dining_tables"."marked_as" in ('reserved', 'closed')),
	CONSTRAINT "dining_tables_state_check" CHECK("dining_tables"."state" in ('free', 'seated', 'waiting', 'needs_clearing', 'offline'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dining_tables_venue_number_idx` ON `dining_tables` (`venue_id`,`number`);--> statement-breakpoint
CREATE INDEX `dining_tables_section_idx` ON `dining_tables` (`section_id`);--> statement-breakpoint
CREATE TABLE `invites` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`role` text NOT NULL,
	`email` text,
	`phone` text,
	`token_hash` text NOT NULL,
	`invited_by` integer,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "invites_role_check" CHECK("invites"."role" in ('owner', 'manager', 'waiter', 'installer', 'support')),
	CONSTRAINT "invites_contact_check" CHECK("invites"."email" is not null or "invites"."phone" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invites_token_hash_unique` ON `invites` (`token_hash`);--> statement-breakpoint
CREATE INDEX `invites_venue_idx` ON `invites` (`venue_id`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer,
	`number` text NOT NULL,
	`billed_to` text NOT NULL,
	`lines` text NOT NULL,
	`total_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`issued_at` integer DEFAULT (unixepoch()) NOT NULL,
	`due_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "invoices_status_check" CHECK("invoices"."status" in ('open', 'paid', 'failed', 'void')),
	CONSTRAINT "invoices_total_check" CHECK("invoices"."total_cents" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE INDEX `invoices_venue_idx` ON `invoices` (`venue_id`);--> statement-breakpoint
CREATE TABLE `outages` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`box_id` integer,
	`camera_id` integer,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`push_sent_at` integer,
	`sms_sent_at` integer,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "outages_device_check" CHECK("outages"."box_id" is not null or "outages"."camera_id" is not null)
);
--> statement-breakpoint
CREATE INDEX `outages_venue_started_idx` ON `outages` (`venue_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`asked_by` integer,
	`question` text NOT NULL,
	`answer` text,
	`model` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asked_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `questions_venue_created_idx` ON `questions` (`venue_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`kind` text NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`stats` text NOT NULL,
	`language` text NOT NULL,
	`body` text,
	`model` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reports_kind_check" CHECK("reports"."kind" in ('nightly', 'weekly', 'pilot', 'monthly')),
	CONSTRAINT "reports_language_check" CHECK("reports"."language" in ('sq', 'mk', 'en'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_venue_kind_period_idx` ON `reports` (`venue_id`,`kind`,`period_start`);--> statement-breakpoint
CREATE TABLE `sections` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sections_venue_name_idx` ON `sections` (`venue_id`,`name`);--> statement-breakpoint
CREATE TABLE `service_hours` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`weekday` integer NOT NULL,
	`opens_at` text NOT NULL,
	`closes_at` text NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "service_hours_weekday_check" CHECK("service_hours"."weekday" between 1 and 7),
	CONSTRAINT "service_hours_time_check" CHECK(length("service_hours"."opens_at") = 5 and time("service_hours"."opens_at") is not null and length("service_hours"."closes_at") = 5 and time("service_hours"."closes_at") is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_hours_venue_day_idx` ON `service_hours` (`venue_id`,`weekday`,`opens_at`);--> statement-breakpoint
CREATE TABLE `shift_assignments` (
	`id` integer PRIMARY KEY NOT NULL,
	`shift_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`section_id` integer,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shift_assignments_shift_user_section_idx` ON `shift_assignments` (`shift_id`,`user_id`,`section_id`);--> statement-breakpoint
CREATE INDEX `shift_assignments_user_idx` ON `shift_assignments` (`user_id`);--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`manager_on_duty_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manager_on_duty_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "shifts_time_check" CHECK("shifts"."ends_at" > "shifts"."starts_at")
);
--> statement-breakpoint
CREATE INDEX `shifts_venue_starts_idx` ON `shifts` (`venue_id`,`starts_at`);--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY NOT NULL,
	`camera_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`is_blurred` integer DEFAULT false NOT NULL,
	`taken_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `snapshots_camera_idx` ON `snapshots` (`camera_id`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`status` text DEFAULT 'pilot' NOT NULL,
	`plan` text,
	`price_cents` integer,
	`is_founding` integer DEFAULT false NOT NULL,
	`extra_cameras` integer DEFAULT 0 NOT NULL,
	`payment_method` text,
	`pilot_started_at` integer,
	`current_period_end` integer,
	`cancelled_at` integer,
	`ends_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "subscriptions_status_check" CHECK("subscriptions"."status" in ('pilot', 'active', 'past_due', 'suspended', 'cancelled')),
	CONSTRAINT "subscriptions_plan_check" CHECK("subscriptions"."plan" in ('monthly', 'yearly')),
	CONSTRAINT "subscriptions_payment_method_check" CHECK("subscriptions"."payment_method" in ('card', 'bank_transfer')),
	CONSTRAINT "subscriptions_amounts_check" CHECK("subscriptions"."extra_cameras" >= 0 and ("subscriptions"."price_cents" is null or "subscriptions"."price_cents" >= 0))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_venue_id_unique` ON `subscriptions` (`venue_id`);--> statement-breakpoint
CREATE TABLE `table_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`table_id` integer NOT NULL,
	`kind` text NOT NULL,
	`state` text,
	`people_count` integer,
	`source` text NOT NULL,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`table_id`) REFERENCES `dining_tables`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "table_events_kind_check" CHECK("table_events"."kind" in ('state', 'visit')),
	CONSTRAINT "table_events_state_value_check" CHECK("table_events"."state" in ('free', 'seated', 'waiting', 'needs_clearing', 'offline')),
	CONSTRAINT "table_events_source_check" CHECK("table_events"."source" in ('box', 'tap')),
	CONSTRAINT "table_events_state_check" CHECK(("table_events"."kind" = 'state') = ("table_events"."state" is not null)),
	CONSTRAINT "table_events_people_check" CHECK("table_events"."people_count" is null or "table_events"."people_count" >= 0)
);
--> statement-breakpoint
CREATE INDEX `table_events_venue_time_idx` ON `table_events` (`venue_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `table_events_table_time_idx` ON `table_events` (`table_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`password_hash` text NOT NULL,
	`language` text DEFAULT 'sq' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "users_language_check" CHECK("users"."language" in ('sq', 'mk', 'en')),
	CONSTRAINT "users_contact_check" CHECK("users"."email" is not null or "users"."phone" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE TABLE `venue_members` (
	`id` integer PRIMARY KEY NOT NULL,
	`venue_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`wants_escalations` integer DEFAULT false NOT NULL,
	`wants_reports` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "venue_members_role_check" CHECK("venue_members"."role" in ('owner', 'manager', 'waiter', 'installer', 'support'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `venue_members_venue_user_idx` ON `venue_members` (`venue_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `venue_members_user_idx` ON `venue_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `venues` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`timezone` text DEFAULT 'Europe/Belgrade' NOT NULL,
	`status` text DEFAULT 'setup' NOT NULL,
	`live_since` integer,
	`waiting_threshold_min` integer DEFAULT 5 NOT NULL,
	`clearing_threshold_min` integer DEFAULT 3 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "venues_country_check" CHECK("venues"."country" in ('XK', 'MK')),
	CONSTRAINT "venues_status_check" CHECK("venues"."status" in ('setup', 'live')),
	CONSTRAINT "venues_waiting_threshold_check" CHECK("venues"."waiting_threshold_min" between 2 and 15),
	CONSTRAINT "venues_clearing_threshold_check" CHECK("venues"."clearing_threshold_min" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` integer PRIMARY KEY NOT NULL,
	`table_id` integer NOT NULL,
	`camera_id` integer NOT NULL,
	`polygon` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`table_id`) REFERENCES `dining_tables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`camera_id`) REFERENCES `cameras`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "zones_source_check" CHECK("zones"."source" in ('claude', 'manual'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zones_table_camera_idx` ON `zones` (`table_id`,`camera_id`);--> statement-breakpoint
CREATE INDEX `zones_camera_idx` ON `zones` (`camera_id`);
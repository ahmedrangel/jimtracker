CREATE TABLE `history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`match_id` text NOT NULL,
	`puuid` text NOT NULL,
	`kills` integer DEFAULT 0 NOT NULL,
	`deaths` integer DEFAULT 0 NOT NULL,
	`assists` integer DEFAULT 0 NOT NULL,
	`is_remake` integer DEFAULT 0 NOT NULL,
	`result` integer NOT NULL,
	`champion_id` integer NOT NULL,
	`is_surrender` integer DEFAULT 0 NOT NULL,
	`duration` integer NOT NULL,
	`date` integer NOT NULL,
	`snapshot_tier` text,
	`snapshot_division` text,
	`snapshot_lp` integer
);

CREATE UNIQUE INDEX `history_match_id_unique` ON `history` (`match_id`);
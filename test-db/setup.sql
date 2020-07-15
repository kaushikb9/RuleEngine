DROP TABLE IF EXISTS entity;
CREATE TABLE entity (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(50),
	`identifier` VARCHAR(50),
	`created_on` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_on` datetime DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS checkpoint;
CREATE TABLE checkpoint (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(50),
	`sequence` INT,
	`created_on` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_on` datetime DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS activity;
CREATE TABLE activity (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`checkpoint_id` INT NOT NULL,
	`entity_id` INT NOT NULL,
	`type` enum('checkin','checkout') NOT NULL,
	`updated_on` datetime DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (checkpoint_id) REFERENCES checkpoint(id),
	FOREIGN KEY (entity_id) REFERENCES entity(id)
);

DROP TABLE IF EXISTS rule;
CREATE TABLE rule (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`expression` VARCHAR(300) NOT NULL,
	`active` BOOLEAN,
	`created_on` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_on` datetime DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS checkpoint_has_rule;
CREATE TABLE checkpoint_has_rule (
	`checkpoint_id` INT NOT NULL,
	`rule_id` INT NOT NULL,
	`created_on` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_on` datetime DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (checkpoint_id) REFERENCES checkpoint(id),
	FOREIGN KEY (rule_id) REFERENCES rule(id)
);


INSERT INTO `entity` (`id`, `name`, `identifier`, `created_on`, `updated_on`)
VALUES
	(1, 'Truck 1', 'MH-01 A-1234', now(), now()),
	(2, 'Truck 2', 'KA-01 A-1234', now(), now()),
	(3, 'Truck 3', 'MH-03 A-4567', now(), now());

INSERT INTO `checkpoint` (`id`, `name`, `sequence`, `created_on`, `updated_on`)
VALUES
	(1, 'Site Entry', 1, now(), now()),
	(2, 'Site Exit', 2, now(), now()),
	(3, 'Refinery Entry', 3, now(), now()),
	(4, 'Refinery Exit', 4, now(), now()),
	(5, 'Warehouse Entry', 5, now(), now()),
	(6, 'Warehouse Exit', 6, now(), now());

INSERT INTO `rule` (`id`, `expression`, `active`, `created_on`, `updated_on`)
VALUES
	(1, '$EXISTS=1', 1, '2020-07-15 17:45:50', '2020-07-15 17:45:50'),
	(2, '$CURRENT_CHECKPOINT_SEQ = $LAST_CHECKPOINT_SEQ + 1', 1, '2020-07-15 17:46:14', '2020-07-15 17:46:14'),
	(3, '$DAYS_SINCE_AT_CURRENT_CHECKPOINT > 1w', 1, '2020-07-15 17:47:54', '2020-07-15 17:47:54');

INSERT INTO `checkpoint_has_rule` (`checkpoint_id`, `rule_id`, `created_on`, `updated_on`)
VALUES
	(1, 3, now(), now()),
	(2, 1, now(), now()),
	(3, 2, now(), now()),
	(4, 2, now(), now()),
	(5, 2, now(), now()),
	(6, 2, now(), now());

INSERT INTO `activity` (`id`, `checkpoint_id`, `entity_id`, `type`, `updated_on`)
VALUES
	(1, 1, 1, 'checkin', '2020-07-07 19:51:16'),
	(2, 2, 1, 'checkout', '2020-07-15 19:51:29'),
	(3, 3, 1, 'checkin', '2020-07-15 19:51:40'),
	(4, 4, 1, 'checkout', '2020-07-15 19:51:53'),
	(5, 5, 1, 'checkin', '2020-07-15 19:52:14'),
	(6, 6, 1, 'checkout', '2020-07-15 19:52:22'),
	(8, 1, 2, 'checkin', '2020-07-15 20:47:32');
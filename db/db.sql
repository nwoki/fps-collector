SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS players;
CREATE TABLE players (
    guid varchar (6) NOT NULL,
    name varchar (24) NOT NULL,
    PRIMARY KEY (guid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS killcount;
CREATE TABLE killcount (
    id int unsigned NOT NULL AUTO_INCREMENT,
    killer varchar (6) NOT NULL,
    victim varchar (6) NOT NULL,
    kills int (10) unsigned NOT NULL DEFAULT 0,
    head int (6) unsigned NOT NULL DEFAULT 0,
    neck int (6) unsigned NOT NULL DEFAULT 0,
    torso_upper int (6) unsigned NOT NULL DEFAULT 0,
    torso_lower int (6) unsigned NOT NULL DEFAULT 0,
    left_arm_upper int (6) unsigned NOT NULL DEFAULT 0,
    left_arm_lower int (6) unsigned NOT NULL DEFAULT 0,
    right_arm_upper int (6) unsigned NOT NULL DEFAULT 0,
    right_arm_lower int (6) unsigned NOT NULL DEFAULT 0,
    left_leg_upper int (6) unsigned NOT NULL DEFAULT 0,
    left_leg_lower int (6) unsigned NOT NULL DEFAULT 0,
    right_leg_upper int (6) unsigned NOT NULL DEFAULT 0,
    right_leg_lower int (6) unsigned NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (killer) REFERENCES players (guid) ON DELETE CASCADE,
    FOREIGN KEY (victim) REFERENCES players (guid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS wins;
CREATE TABLE wins (
    player varchar (6),
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY (player),
    FOREIGN KEY (player) REFERENCES players (guid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;

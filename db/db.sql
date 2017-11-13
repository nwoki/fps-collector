SET FOREIGN_KEY_CHECKS = 0;

-- VERSION 1
-- HOLDS ONLY INFORMATION REGARDING KILLS


-- DROP TABLE IF EXISTS players;
-- CREATE TABLE players (
--     id int unsigned NOT NULL AUTO_INCREMENT,
--     firebase_uuid varchar (28) NOT NULL,
--     nick varchar (28) NOT NULL, (used for data showing on website)
--     PRIMARY KEY (id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS aliases;
CREATE TABLE aliases (
    id int unsigned NOT NULL AUTO_INCREMENT,
    name varchar (20) NOT NULL,
--     player_id int unsigned NOT NULL
    PRIMARY KEY (id)
--     FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Killer and Victim point to the
DROP TABLE IF EXISTS killcount;
CREATE TABLE killcount (
    id int unsigned NOT NULL AUTO_INCREMENT,
    killer int unsigned NOT NULL,
    victim int unsigned NOT NULL,
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
    FOREIGN KEY (killer) REFERENCES aliases (id) ON DELETE CASCADE,
    FOREIGN KEY (victim) REFERENCES aliases (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS wins;
CREATE TABLE wins (
    alias_id int unsigned NOT NULL,
    win_count int NOT NULL DEFAULT 0,
    PRIMARY KEY (alias_id),
    FOREIGN KEY (alias_id) REFERENCES aliases (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;

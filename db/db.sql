SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS players;
CREATE TABLE players (
    guid varchar (6) NOT NULL,
    name varchar (24) NOT NULL,
    PRIMARY KEY (guid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS killcount;
CREATE TABLE killcount (
    killer varchar (6) NOT NULL,
    victim varchar (6) NOT NULL,
    kills int (10) unsigned NOT NULL,
    body_part varchar (10) NOT NULL,
    PRIMARY KEY (killer),
    FOREIGN KEY (killer) REFERENCES players (guid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS wins;
CREATE TABLE wins (
    player varchar (6),
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY (player),
    FOREIGN KEY (player) REFERENCES players (guid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;

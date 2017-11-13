/**
 * MYSQLHANDLER
 *
 * for this module we'll be using the POOLING technique (https://www.npmjs.com/package/mysql#pooling-connections). Let's not waste resources where not necessary. Also
 * this sets the base for heavy loading in case other games/parsers are added to the project
 */

var mysql = require("mysql");
var redis = require("redis");

var pool = mysql.createPool({
    connectionLimit : 5,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB_NAME
});

// REDIS
//------
var client = redis.createClient();

client.on('connect', function() {
    console.log('Connected to Redis');
});



function addPlayer(playerName) {
    console.log("[AddPlayer]");
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("");
        } else {
            // TODO check that both players are in the db before creating this relationship
            // add the player to our database
            connection.query(mysql.format("insert into aliases (name) values(?)", [playerName]), function(error, results, fields) {
                if (error) {
                    console.log("ERR- " + error);
                } else {
                    connection.release();
                    console.log("[Mysqlhandler::addPlayer] player added with id: " + results.insertId );

                    // TODO add to the redis db for quick retrieval
                    // add alias id to the redis db
                    client.set(playerName, results.insertId);
                }
            });
        }
    });
}


/** check if the player is already stored on the database. If not, add it */
function playerExists(playerName) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("[Mysqlhandler::playerexists] ERROR: " + err);
        } else {
            // TODO first check we've already got it in the redis db
            console.log("[Mysqlhandler::playerexists] looking for: " + playerName);
            connection.query(mysql.format("select id from aliases where name=?", [playerName]), function (error, results, fields) {
                if (err) {
                    console.log("ERR- " + error);
                } else {
                    connection.release();
                    console.log("COUNT: " + results.length);

                    if (results.length == 0) {
                        addPlayer(playerName);
                    }
                }
            });
        }
    });
}

function playerKill(jsonData) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("[Mysqlhandler::playerKill] ERROR: " + err);
        } else {
            connection.query(mysql.format("select id from killcount where killer=? and victim=?", [jsonData["killer_guid"], jsonData["victim_guid"]]), function (error, results, fields) {
                if (err) {
                    console.log("[Mysqlhandler::playerKill] ERROR: " + error);
                } else {
                    console.log("COUNT: " + results.length);

                    if (results.length == 0) {
                        // create the new relationship
                        connection.query(mysql.format("insert into killcount (killer, victim, kills, ??) values (?, ?, 1, 1)", [jsonData["body_part"], jsonData["killer_guid"], jsonData["victim_guid"]]), function (error, results, fields) {
                            if (error) {
                                console.log("[Mysqlhandler::playerKill] Insert error: " + error);
                            }
                            connection.release();
                        });
                    } else {
                        // update stats
                        connection.query(mysql.format("update killcount set kills=kills+1, ??=??+1 where killer=? and victim=?", [jsonData["body_part"], jsonData["body_part"], jsonData["killer_guid"], jsonData["victim_guid"]]), function (error, results, fields) {
                            if (error) {
                                console.log("[Mysqlhandler::playerKill] ERROR: " + error);
                            }
                            connection.release();
                        });
                    }
                }
            });
        }
    });
}


module.exports = {
    playerJoined: function(data) {
        // we receive the following json object
        //  "data": {
        //     "action": "J",
        //     "guid": "asdasdads",
        //     "name": "asasd"
        // }
        playerExists(/*data["guid"], */data["name"]);
    },
    playerKilled: function (data) {
        // we receive the follogin json
        // {"type":"K","victim_guid":"929642","victim_name":"Tegamen","killer_guid":"705473","killer_name":"Sbiego","body_part":"head"}
        playerKill(data);
    }
}

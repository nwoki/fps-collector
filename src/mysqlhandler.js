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
var redisClient = redis.createClient();

redisClient.on('connect', function() {
    console.log('Connected to Redis');
});


process.on(
    "unhandledRejection",
    function handleWarning( reason, promise ) {

        console.log( "[PROCESS] Unhandled Promise Rejection" ) ;
        console.log( "- - - - - - - - - - - - - - - - - - -" ) ;
        console.log( reason );
        console.log(  "- -" );

    });




/** returns a promise with a check for the key on the redis database */
function getRedisData(key) {
    var promise = new Promise(function(resolve, reject) {
        redisClient.get(key, function(err, reply) {
            if (reply == null) {
                reject(Error("Key " + key + " not present in redis database"));
            } else {
                resolve(reply);
            }
        });
    });
    return promise;
}

/** returns a promise for a query on the sql database */
function executeSqlQuery(query) {
    var promise = new Promise(function(resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(Error("[Mysqlhandler::executeSqlQuery] ERROR: " + err));
            } else {
                console.log("[Mysqlhandler::executeSqlQuery] executing: " + query);
                connection.query(query, function (error, results, fields) {
                    if (err) {
                        reject(Error("[Mysqlhandler::executeSqlQuery] ERROR: " + error));
                    } else {
                        connection.release();
                        console.log("[Mysqlhandler::executeSqlQuery] COUNT: " + results.length);
                        resolve(results);
                    }
                });
            }
        });
    });

    return promise;
}

/**
 * adds a player to the sql database and uses the insert id to cache it into redis
 *
 * @return the id of the inserted player
 */
function addPlayer(playerName) {
    var promise = new Promise(function(resolve, reject) {
        console.log("[AddPlayer]");
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(Error("[Mysqlhandler::addPlayer] ERROR: " + err));
            } else {
                // add the player to our database
                executeSqlQuery(mysql.format("insert into aliases (name) values(?)", [playerName])).then(function(data) {
                    console.log("[Mysqlhandler::addPlayer] player added with id: " + data.insertId);
                    connection.release();

                    // add alias id to the redis db
                    redisClient.set(playerName, data.insertId);
                    resolve(data.insertedId);
                }, function(error) {
                    reject(error);
                });
            }
        });
    });

    return promise;
}

/**
 * Pulls information from the database and stash it to redis if available
 *
 * @return the id of the requested player
 */
function getPlayerFromDatabase(playerName) {
    var promise = new Promise(function(resolve, reject) {
        // pull data from redis db
        getRedisData(playerName).then(function(data) {
            console.log("[getPlayerFromDatabase] REDIS RETURNED -> " + data);
            resolve(data);
        }, function(error) {
            console.log("[getPlayerFromDatabase] REDIS ERRORED -> " + error);

            // lookup the database to see if the player name is stashed there
            executeSqlQuery(mysql.format("select id from aliases where name=?", [playerName])).then(function(data) {
                if (data.length > 0) {
                    // set the data in the redis db
                    redisClient.set(playerName, data[0].id);
                    resolve(data[0].id);
                } else {
                    reject(null);
                }
            }, function(error) {
                console.log("[getPlayerFromDatabase] ERROR: " + error);
                reject(Error(error));
            });
        });
    });

    return promise;
}


function checkPlayerExistance(playerName) {
    var promise = new Promise(function(resolve, reject) {
        getPlayerFromDatabase(playerName).then(function(data) {
            console.log("YAY -> " + data);
            resolve(data);
        }, function(error) {
            // add the alias so we can use it for the killcount table
            addPlayer(playerName).then(function(data) {
                console.log("PLAYER CORRECTLY ADDED -> " + data);
                resolve(data);
            }, function(error) {
                console.log("THERE WAS A PROBLEM: " + error);
                reject(error);
            });
        });
    });

    return promise;
}

// function addPlayer(playerName) {
//     console.log("[AddPlayer]");
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             console.log("");
//         } else {
//             // TODO check that both players are in the db before creating this relationship
//             // add the player to our database
//             connection.query(mysql.format("insert into aliases (name) values(?)", [playerName]), function(error, results, fields) {
//                 if (error) {
//                     console.log("ERR- " + error);
//                 } else {
//                     connection.release();
//                     console.log("[Mysqlhandler::addPlayer] player added with id: " + results.insertId );
//
//                     // add alias id to the redis db
//                     redisClient.set(playerName, results.insertId);
//                 }
//             });
//         }
//     });
// }

/** check if the player is already stored on the database. If not, add it */
function playerExists(playerName) {
    // first thing to do is to check the redis database for the player we're looking for
    redisClient.get(playerName, function(err, reply) {
        // reply is null when the key is missing
        console.log("-------> " + reply);

        if (reply == null) {
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
                            } else {
                                // add alias id to the redis db (cache it)
                                redisClient.set(playerName, results.insertId);
                            }
                        }
                    });
                }
            });
        }
    });
}

function playerKill(jsonData) {
    // We check that the alias ids are in the db and stashed to redis before adding the kill record
    let killerId;
    let victimId;

    // Killer
    checkPlayerExistance(jsonData["killer_name"]).then(function(data) {
        console.log("Player in db");
        killerId = data;

        // Victim
        checkPlayerExistance(jsonData["victim_name"]).then(function(data) {
            console.log("Player in db");
            victimId = data;

            console.log("RETURNED VALUES: " + killerId + " - " + victimId);

            // does a record already exist?
            executeSqlQuery(mysql.format("select id from killcount where killer=? and victim=?", [killerId, victimId])).then(function(data) {
                console.log("KILL RECORD EXISTS! " + data);

                if (data != 0) {
                    // add kill record to db
                    executeSqlQuery(mysql.format("update killcount set kills=kills+1, ??=??+1 where id=?", [jsonData["body_part"], jsonData["body_part"], data[0].id])).then(function(data) {
                        console.log("KILL RECORD CORRECTLY ADDED");
                        return true;
                    }, function(error) {
                        console.log("FUCK " + error);
                        return false;
                    });
                } else {
                    // add kill record to db
                    executeSqlQuery(mysql.format("insert into killcount (killer, victim, kills, ??) values (?, ?, 1, 1)", [jsonData["body_part"], killerId, victimId])).then(function(data) {
                        console.log("KILL RECORD CORRECTLY ADDED");
                        return true;
                    }, function(error) {
                        console.log("FUCK " + error);
                        return false;
                    });
                }
            }, function(error) {
                console.log("ERROR: ! " + error);
                return false;
            });
        }, function(error) {
            console.log("Can't add player to db");
            return false;
        });
    }, function(error) {
        console.log("Can't add player to db");
        return false;
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
        console.log("PLAYER KILL REGISTERED LOG: " + playerKill(data));
    }
}

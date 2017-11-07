/**
 * MYSQLHANDLER
 *
 * for this module we'll be using the POOLING technique (https://www.npmjs.com/package/mysql#pooling-connections). Let's not waste resources where not necessary. Also
 * this sets the base for heavy loading in case other games/parsers are added to the project
 */

var mysql = require("mysql");
var pool = mysql.createPool({
    // TODO load from env
    connectionLimit : 5,
    host: "localhost",
    user: "root",
    password: "root",
    database: "cod2"
});




function addPlayer(playerGuid, playerName) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("");
        } else {
            // add the player to our database
            connection.query("insert into players values(\"" + playerGuid + "\",\"" + playerName + "\")", function() {
                if (err) {
                    console.log("ERR- " + error);
                } else {
                    connection.release();
                    console.log("[Mysqlhandler::addPlayer] player added");
                }
            });
        }
    });
}


/** check if the player is already stored on the database. If not, add it */
function playerExists(playerGuid, playerName) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("[Mysqlhandler::playerexists] ERROR: " + err);
        } else {
            console.log(" lookgin for: " + playerGuid);
            connection.query("select * from players where guid=\"" + playerGuid + "\"", function (error, results, fields) {
                if (err) {
                    console.log("ERR- " + error);
                } else {
                    connection.release();
                    console.log("COUNT: " + results.length);

                    if (results.length == 0) {
                        addPlayer(playerGuid, playerName);
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
        playerExists(data["guid"], data["name"]);
    }
}

/**
 * Collector
 * ========
 *
 * Basicall a UDP server that takes incoming info from parsers and stores them into the db.
 *
 * TODO:
 * - rest api for frontend/mobile/whatever (READ ONLY)
 */


/* Let's go with a UDP server. Can't be bothered to handle
 * multiple clients. And the data to receive is not large, so who cares, it's
 * just some stats
 */
require('dotenv').config()
const dgram = require("dgram");
var server = dgram.createSocket("udp4");
var mysqlHandler = require("./mysqlhandler.js");



function parseMessage(message, remoteInfo) {
    console.log("GOT -> " + message);

    // parse data
    try {
        var jsonObject = JSON.parse(message);
        console.log("JOIN JSON IS: " + jsonObject);
        var dataObj = jsonObject["data"];
        var actionType = dataObj["type"];

        // JOIN
        // {\"data\":{\"action\":\"J\", \"guid\":\"12asd34414\", \"name\":\"unknwon \"}}
        //         {
        //             "data": {
        //                 "action": "J",
        //                 "guid": "asdasdads",
        //                 "name": "asasd"
        //             }
        //         }
        if (actionType == "J") {
            // add to database if missing
            mysqlHandler.playerJoined(dataObj);
        } else if (actionType == "K") {
            // check if the killer - victim relationship exists
            mysqlHandler.playerKilled(dataObj);
        }

        // KILL
//         {
//             "data": {
//                 "action": "K",
//                 "killer_guid": "guid1",
//                 "victim_guid": "guid2",
//                 "body_part": "head/torso_lower"
//             }
//         }

    } catch (e) {
        console.log("data: " + message + " is not a valid JSON text");
        console.log(e.message);
    }
};

server.on("error", (err) => {
    console.log("server error:\n${err.stack}");
    server.close();
});

server.on("listening", function() {
    console.log("UDP server ready! Listening on port: " + server.address().port);
});

server.on("message", parseMessage);

server.bind(process.env.COLLECTOR_PORT);



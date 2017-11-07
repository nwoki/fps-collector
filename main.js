/**
 * Collector
 * ========
 *
 * Basicall a UDP server that takes incoming info from parsers and stores them into the db.
 *
 * TODO:
 * - rest api for frontend/mobile/whatever (READ ONLY)
 */

require('dotenv').config()
const dgram = require("dgram");
var server = dgram.createSocket("udp4");
var mysqlHandler = require("./mysqlhandler.js");



function parseMessage(message, remoteInfo) {
    console.log("[Main::parseMessage] got -> " + message);

    // parse data
    try {
        var jsonObject = JSON.parse(message);
        console.log("JOIN JSON IS: " + jsonObject);
        var dataObj = jsonObject["data"];
        var actionType = dataObj["type"];

        if (actionType == "J") {
            // add to database if missing
            mysqlHandler.playerJoined(dataObj);
        } else if (actionType == "K") {
            // check if the killer - victim relationship exists
            mysqlHandler.playerKilled(dataObj);
        }
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
    console.log("Collector server ready! Listening on port: " + server.address().port);
});

server.on("message", parseMessage);

server.bind(process.env.COLLECTOR_PORT);



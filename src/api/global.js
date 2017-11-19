var express = require("express");
var router = express.Router();

var mysql = require("../mysqlhandler.js");


// define the home page route
router.get('/topscorers', function (req, res) {
    mysql.players().then((data) => {
        res.send(JSON.stringify(data));
    }, (error) => {
        res.send(JSON.stringify(error));
    });
})

module.exports = router;

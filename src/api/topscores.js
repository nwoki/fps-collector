var express = require("express");
var router = express.Router();

var mysql = require("../mysqlhandler.js");


// Category array
var categories = ["head", "neck", "torso_upper", "torso_lower", "left_arm_upper", "left_arm_lower", "right_arm_upper", "right_arm_lower", "left_leg_upper", "left_leg_lower"
    , "right_leg_upper", "right_leg_lower", "left_foot", "right_foot", "frag"];


// not allowed
// router.get('/', function (req, res) {
//     mysql.players().then((data) => {
//         res.send(JSON.stringify(data));
//     }, (error) => {
//         res.send(JSON.stringify(error));
//     });
// })

router.get('/kills', function (req, res) {
    mysql.topScoresKills().then((data) => {
        res.send(data);
    }, (error) => {
        res.send(error);
    });
})

router.get('/:category', (req, res) => {
    console.log("PARAMS: " + req.params);

    let found = false;

    // TODO - isn't there a hash function in order to do this quicker?
    for (let i = 0; i < categories.length && !found; ++i) {
        if (req.params.category == categories[i]) {
            found = true;
        }
    }

    if (found) {
        mysql.topScoresCategory(req.params.category).then((data) => {
            res.send(data);
        }, (error) => {
            res.send(error);
        });
    } else {
        let jsonObj = {};
        jsonObj["error"] = "Category '" + req.params.category + "' not supported";

        res.send(JSON.stringify(jsonObj));
    }
})

module.exports = router;

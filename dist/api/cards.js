var express = require('express');
var router = express.Router();
var https = require('https');


var getAllCards = function(req, res){
	console.log("User ID: ", req.userId);
	console.log("App ID: ", req.appId);
    var db = req.db;
    db.collection('cards').find().toArray(function (err, items) {
        res.json(items);
    });
}

/*
 * GET all cards.
 */
router.get('', function(req, res) {
	getAllCards(req, res);
});

router.get('/', function(req, res) {
	getAllCards(req, res);
});

/*
 * GET one cards.
 */
router.get('/:code', function(req, res) {
	getAllCards(req, res);
});

module.exports = router;
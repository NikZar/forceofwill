var express = require('express');
var router = express.Router();
var https = require('https');


var getAllDecks = function(req, res){
	console.log("User ID: ", req.userId);
	console.log("App ID: ", req.appId);
    var db = req.db;
    db.collection('decks').find().toArray(function (err, items) {
        res.json(items);
    });
}

/*
 * GET all decks.
 */
router.get('', function(req, res) {
	getAllDecks(req, res);
});

router.get('/', function(req, res) {
	getAllDecks(req, res);
});

module.exports = router;
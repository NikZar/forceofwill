var express = require('express');
var router = express.Router();
var https = require('https');


var getAllDecks = function(req, res){
    var db = req.db;
    db.collection('decks').find().toArray(function (err, items) {
        res.json(items);
    });
}

var getDeck = function(req, res){
    var db = req.db;
    var id = req.params.id;
    db.collection('decks').find({id: id}).toArray(function (err, items) {
    	if(items[0].userId === req.userId){
        	res.json(items[0]);
    	} else {
        	res.json({});
    	}
    });
}

/*
 * GET a deck.
 */
router.get('/:id', function(req, res) {
	getDeck(req, res);
});

router.get('/:id/', function(req, res) {
	getDeck(req, res);
});
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
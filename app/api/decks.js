var express = require('express');
var router = express.Router();


var getAllDecks = function(req, res){
    var db = req.db;
    db.collection('decks').find().toArray(function (err, items) {
        res.json(items);
        db.close();
    });
}

var getDeck = function(req, res){
    var db = req.db;
    var id = req.params.id;
    db.collection('decks').find({id: id}).toArray(function (err, items) {
    	if(items[0].userId === req.userId){
        	res.json(items[0]);
            db.close();
    	} else {
        	res.send(500);
            db.close();
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
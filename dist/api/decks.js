var express = require('express');
var router = express.Router();

var addCard = function(req, res){
    var card = req.body;
    var db = req.db;
    var userId = req.userId;

    db.collection('decks').findOne({userId: userId, Code: card.Code}, function(err, result) {
        if (err) {
            res.send(500).end();
        }
        if(result){
            //console.log("Updating Card: ", card);
            db.collection('binders').update({userId: userId, Code: card.Code}, {'$set':{count: (result.count+1) }}, function(err) {
                if (err) {
                    res.send(500).end();
                }
                if (result) {
                    res.json({});
                }
                db.close();
            });
        } else {
            //console.log("Inserting Card with Counter: ", card);
            db.collection('binders').insert({userId: userId, Code: card.Code, count: 1}, function(err, result) {
                if (err) {
                    res.send(500).end();
                }
                if (result) {
                    res.json({});
                }
                db.close();
            });
        }
    });
}

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

var addDeck = function(req, res){
    var deck = req.body;
    console.log(deck);
    var db = req.db;
    var userId = req.userId;
}
/*
 * GET a deck.
 */
router.post('', function(req, res) {
    addDeck(req, res);
});

router.post('/', function(req, res) {
    addDeck(req, res);
});
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
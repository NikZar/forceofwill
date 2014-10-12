var express = require('express');
var router = express.Router();


var addCard = function(req, res){
	var card = req.body;
    var db = req.db;
    var userId = req.userId;

    db.collection('binders').findOne({userId: userId, Code: card.Code}, function(err, result) {
		if (err) {
			res.send(500).end();
			throw err;
		}
		if(result){
			console.log("Updating Card: ", card);
			db.collection('binders').update({userId: userId, Code: card.Code}, {'$set':{count: (result.count+1) }}, function(err) {
			    if (err) {
					res.send(500).end();
					throw err;
				}
			    if (result) {
			    	res.json({});
			    }
			});
		} else {
			console.log("Inserting Card with Counter: ", card);
			db.collection('binders').insert({userId: userId, Code: card.Code, count: 1}, function(err, result) {
			  	if (err) {
					res.send(500).end();
					throw err;
				}
				if (result) {
					res.json({});
				}
			});
		}
    });
}

var getAllBinderCards = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('binders').find({userId: userId}).toArray(function (err, items) {
        res.json(items);
    });
}


/*
 * GET a deck.
 */
router.post('', function(req, res) {
	addCard(req, res);
});

router.post('/', function(req, res) {
	addCard(req, res);
});
/*
 * GET all decks.
 */
router.get('', function(req, res) {
	getAllBinderCards(req, res);
});

router.get('/', function(req, res) {
	getAllBinderCards(req, res);
});

module.exports = router;
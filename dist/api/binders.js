var express = require('express');
var router = express.Router();


var addCard = function(req, res){
	var card = req.body;
    var db = req.db;
    var userId = req.userId;

    console.log("Card: ", card);

    db.collection('binders').findOne({userId: userId, code: card.code}, function(err, result) {
		if (err) {
			res.send(500).end();
		}
		if(result){
			//console.log("Updating Card: ", card);
			db.collection('binders').update({userId: userId, code: card.code}, {'$set':{qty: (result.qty+1) }}, function(err) {
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
			db.collection('binders').insert({userId: userId, code: card.code, qty: 1}, function(err, result) {
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

var getAllBinderCards = function(req, res){
    var db = req.db;
    var userId = req.userId;

    var promiseBinders = db.collection('binders').find({userId: userId}).toArrayAsync();
    
    promiseBinders.then(function(binderCards) {
	    if (binderCards) {
	    	var binderCodes = binderCards.map(function(element){
	    		return element.code;
	    	});
	    	var promiseCards = db.collection('cards').find({code: {$in: binderCodes} }).toArrayAsync();
			promiseCards.then(function(cards){

				var bindersDictionary = {};

				for (var i = 0; i < binderCards.length; i++) {
					bindersDictionary[binderCards[i].code] = binderCards[i].qty;
				};

				for (var i = 0; i < cards.length; i++) {
					cards[i].qty = bindersDictionary[cards[i].code];
				};

				db.close();
				console.log("Binder Cards: " , cards);
				res.json(cards);
			});

	    }
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
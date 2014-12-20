var express = require('express');
var router = express.Router();

/*
	db.binders.find()
	{ "_id" : ObjectId(""), "userId" : "", "code" : "1-001 R", "qty" : 3 }
*/

/*
 * DELETE a binder card.
 */

var deleteCard = function(req, res, code){
	var userId = req.userId;
	var db = req.db;
	db.collection('binders').findOne(
		{userId: userId, code: code}, 
		function(err, result) {
			if (err) {
				console.log("Error finding card");
				db.close();
				res.sendStatus(500).end();
			}
			if(result){
				db.collection('binders').remove({userId: userId, code: code}, function(err,result){
						if (err) {
							console.log("Error deleting card");
							res.sendStatus(500).end();
						} else {
							res.sendStatus(200).end();
						}
						db.close();
					}
				);
			} else {
				db.close();
				res.sendStatus(404).end();
			}
		}
	);
}

var deleteCardLogged = function(req, res){
	if(req.logged){
		var code = req.params.code;
		deleteCard(req, res, code);
	} else {
		res.sendStatus(500).end();
	}
}

router.delete(':code', function(req, res) {
	deleteCardLogged(req, res);
});

router.delete('/:code', function(req, res) {
	deleteCardLogged(req, res);
});


/*
 * REMOVE binder card qty.
 */

var removeCard = function(req, res, binderCard){
    var db = req.db;
    var userId = req.userId;

    db.collection('binders').findOne({userId: userId, code: binderCard.card.code}, function(err, result) {
		if (err) {
			db.close();
			res.sendStatus(500).end();
		}
		if(result){
			if((result.qty-binderCard.card.qty)>0){
				db.collection('binders').update({userId: userId, code: binderCard.card.code}, 
					{'$set':{qty: (result.qty-binderCard.card.qty)}}, 
					function(err) {
					    if (err) {
							res.sendStatus(500).end();
						}
					    if (result) {
					    	res.sendStatus(200).end();
					    }
					    db.close();
					}
				);
			} else {
				deleteCard(req, res, binderCard.card.code);
			}
			
		} else {
			db.close();
			res.sendStatus(404).end();
		}
    });
}


var removeCardLogged = function(req, res){
	if(req.logged){
		var binderCard = req.body;
		removeCard(req, res, binderCard);
	} else {
		res.sendStatus(500);
	}
}

router.delete('', function(req, res) {
	removeCardLogged(req, res);
});
router.delete('/', function(req, res) {
	removeCardLogged(req, res);
});


/*
 * ADD a binder card.
 */

var addCard = function(req, res, binderCard){
    var db = req.db;
    var userId = req.userId;

    db.collection('binders').findOne({userId: userId, code: binderCard.card.code}, function(err, result) {
		if (err) {
			res.sendStatus(500).end();
		}
		if(result){
			//console.log("Updating Card: ", card);
			db.collection('binders').update({userId: userId, code: binderCard.card.code}, {'$set':{qty: (result.qty+binderCard.qty) }}, function(err) {
			    if (err) {
					res.sendStatus(500).end();
				}
			    if (result) {
			    	res.json({});
			    }
			    db.close();
			});
		} else {
			db.collection('binders').insert({userId: userId, code: binderCard.card.code, qty: binderCard.qty}, function(err, result) {
			  	if (err) {
                	db.close();
					res.sendStatus(500).end();
				}
				if (result) {
					res.json({});
				}
			   	db.close();
			});
		}
    });
}

var addCardLogged = function(req, res){
	if(req.logged){
		var binderCard = req.body;
		addCard(req, res, binderCard);
	} else {
		res.sendStatus(500);
	}
}

router.post('', function(req, res) {
	addCardLogged(req, res);
});
router.post('/', function(req, res) {
	addCardLogged(req, res);
});


/*
 * GET all binder cards.
 */

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

				var expandedBinderCards = [];
				var cardsDictionary = {};

				for (var i = 0; i < cards.length; i++) {
					var card = cards[i];
					cardsDictionary[card.code] = card;
				};

				for (var i = 0; i < binderCards.length; i++) {
					var binderCard = binderCards[i];

					var expandedBinderCard = {card: cardsDictionary[binderCard.code], qty: binderCard.qty};
					expandedBinderCards.push(expandedBinderCard);
				};

				res.status(200).json(expandedBinderCards).end();
				db.close();
			});

	    }
	});
}

var getAllBinderCardsLogged = function(req, res){
	if(req.logged){
		getAllBinderCards(req, res);
	} else {
		res.sendStatus(500);
	}
}

router.get('', function(req, res) {
	getAllBinderCardsLogged(req, res)
});
router.get('/', function(req, res) {
	getAllBinderCardsLogged(req, res)
});

module.exports = router;
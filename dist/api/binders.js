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
	db.collection('binders').findOne({userId: userId, code: code}, function(err, result) {
			if (err) {
				db.close();
				res.sendStatus(500).end();
			}
			if(result){
				db.collection('binders').remove({userId: userId, code: code}, function(err,result){
						if (err) {
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

var removeCard = function(req, res, card){
    var db = req.db;
    var userId = req.userId;

    console.log("Card: ", card);

    db.collection('binders').findOne({userId: userId, code: card.code}, function(err, result) {
		if (err) {
			db.close();
			res.sendStatus(500).end();
		}
		if(result){
			if((result.qty-card.qty)>0){
				db.collection('binders').update({userId: userId, code: card.code}, 
					{'$set':{qty: (result.qty-card.qty)}}, 
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
				deleteCard(req, res, card.code);
			}
			
		} else {
			db.close();
			res.sendStatus(404).end();
		}
    });
}


var removeCardLogged = function(req, res){
	if(req.logged){
		var card = req.body;
		removeCard(req, res, card);
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

var addCard = function(req, res){
	var card = req.body;
    var db = req.db;
    var userId = req.userId;

    console.log("Card: ", card);

    db.collection('binders').findOne({userId: userId, code: card.code}, function(err, result) {
		if (err) {
			res.sendStatus(500).end();
		}
		if(result){
			//console.log("Updating Card: ", card);
			db.collection('binders').update({userId: userId, code: card.code}, {'$set':{qty: (result.qty+card.qty) }}, function(err) {
			    if (err) {
					res.sendStatus(500).end();
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
		var card = req.body;
		addCard(req, res, card);
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
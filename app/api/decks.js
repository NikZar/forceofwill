var express = require('express');
var router = express.Router();
ObjectID = require('mongoskin').ObjectID;


/*
 * DELETE a deck
 */

var deleteDeck = function(req, res, _id){
    var userId = req.userId;
    db.collection('decks').remove({userId: userId, _id: _id}, function(err,result){
            if (err) {
                res.sendStatus(500).end();
            } else {
                res.sendStatus(200).end();
            }
            db.close();
        }
    );
            
}

var deleteDeckLogged = function(req, res){
    if(req.logged){
        var _id = req.params._id;
        deleteDeck(req, res, _id);
    } else {
        res.sendStatus(500);
    }
}

router.delete(':_id', function(req, res) {
    deleteDeckLogged(req, res);
});
router.delete('/:_id', function(req, res) {
    deleteDeckLogged(req, res);
});


/*
 * ADD cards to a deck.
 */

var addCardsToDeck = function(req, res, cards, _id){
    var db = req.db;
    var userId = req.userId;

    console.log("Searching: ", _id);
    db.collection('decks').findOne({_id: new ObjectID(_id), userId: deck.userId},function(err, result) {
        if (err) {
            console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
        }
        if(deck){
            console.log("Found: ", deck);

            var deckDictionary = {};

            for (var i = 0; i < cards.length; i++) {
                cardsDictionary[cards[i].code] += cards[i].qty;
            };

            for (var i = 0; i < result.cards.length; i++) {
                deck.cards[i] += cardsDictionary[result.cards[i].code];
            };

            updateDeck(req, res, deck);
        } else {
            db.close();
            res.sendStatus(404).end();
        }
    });
}

var  addCardsToDeckLogged = function(req, res){
    if(req.logged){
        var cards = req.body;
        var _id = req.params._id;
        addCardsToDeck(req, res, cards, _id)
    } else {
        res.sendStatus(500);
    }
}

router.post('/:_id/cards', function(req, res) {
    addCardsToDeckLogged(req, res);
});
router.post('/:_id/cards/', function(req, res) {
    addCardsToDeckLogged(req, res);
});


/*
 * UPDATE a deck.
 */

var updateDeck = function(req, res, deck){
    var db = req.db;
    var userId = req.userId;
    deck._id = new ObjectID(deck._id);

    console.log("Searching: ", deck);
    db.collection('decks').findOne({_id: deck._id, userId: deck.userId},function(err, result) {
          if (err) {
            db.close();
            console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
          }
          if(result){
            console.log("Found: ", result);
            db.collection('decks').update({_id: deck._id, userId: userId}, deck, function(err, result) {
                if(err){
                    res.sendStatus(500).end();
                }
                if(result){
                    res.sendStatus(200).end();
                } else {
                    res.sendStatus(500).end();
                }
                db.close();
            });
          } else {
            db.close();
            res.sendStatus(404).end();
          }
    });
}

var updateDeckLogged = function(req, res){
    if(req.logged){
        var deck = req.body;
        updateDeck(req, res, deck);
    } else {
        res.sendStatus(500);
    }
}

router.put('', function(req, res) {
    updateDeckLogged(req, res);
});
router.put('/', function(req, res) {
    updateDeckLogged(req, res);
});


/*
 * ADD a new deck.
 */

var addNewDeck = function(req, res, deck){
    var db = req.db;
    var userId = req.userId;
    deck.userId = userId;

    //console.log("Inserting Deck: ",deck);
    db.collection('decks').insert(deck, function(err, deck) {
        if (err) {
            //console.log("Error inserting new deck: ", err, deck);
            res.sendStatus(500).end();
        }
        if (deck) {
            //console.log('Added!', deck);
            res.sendStatus(201).json(deck).end();
        }
        db.close();
    });
}

var addNewDeckLogged = function(req, res){
    if(req.logged){
        var deck = req.body;
        addNewDeck(req, res, deck);
    } else {
        res.sendStatus(500);
    }
}

router.post('', function(req, res) {
    addNewDeckLogged(req, res);
});
router.post('/', function(req, res) {
    addNewDeckLogged(req, res);
});


/*
 * GET all user decks.
 */

var getAllUserDecks = function(req, res){
    var db = req.db;
    var userId = req.userId;
    //console.log("Searching decks");
    db.collection('decks').find({userId: userId}).toArray(function (err, decks) {
        //console.log("Decks for user:", userId, " :", decks);
        res.json(decks).end();
        db.close();
    });
}

var getAllUserDecksLogged = function(req, res){
    if(req.logged){
        getAllUserDecks(req, res);
    } else {
        res.sendStatus(500);
    }
}

router.get('/my', function(req, res) {
    getAllUserDecksLogged(req, res);
});

router.get('/my/', function(req, res) {
    getAllUserDecksLogged(req, res);
});


/*
 * GET a deck.
 */

var getDeck = function(req, res, _id){
    var db = req.db;
    db.collection('decks').find({_id: _id}).toArray(function (err, items) {
        if(err){
            res.sendStatus(500);
            db.close();
        } else {
            res.json(items[0]);
            db.close();
        }
    });
}

var getDeckLogged = function(req, res,_id){
    if(req.logged){
        getDeck(req, res,_id);
    } else {
        res.sendStatus(500);
    }
}

router.get(':_id', function(req, res) {
    var _id = req.params._id;
    getDeckLogged(req, res,_id);
});

router.get('/:_id', function(req, res) {
    getDeckLogged(req, res);
});


/*
 * GET all decks.
 */

var getAllDecks = function(req, res){
    var db = req.db;
    db.collection('decks').find().toArray(function (err, items) {
        res.json(items);
        db.close();
    });
}

var getAllDecksLogged = function(req, res){
    if(req.logged){
        getAllDecks(req, res);
    } else {
        res.sendStatus(500);
    }
}

router.get('', function(req, res) {
	getAllDecksLogged(req, res);
});

router.get('/', function(req, res) {
	getAllDecksLogged(req, res);
});

module.exports = router;
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

router.delete('/:_id', function(req, res) {
    deleteDeckLogged(req, res);
});
router.delete('/:_id/', function(req, res) {
    deleteDeckLogged(req, res);
});


/*
 * ADD cards to a deck.
 */

var addCardsToDeck = function(req, res, cards, _id){
    var db = req.db;
    var userId = req.userId;
    _id = new ObjectID(_id);

    //console.log("Searching: ", _id);
    db.collection('decks').findOne({_id: _id, userId: deck.userId},function(err, result) {
        if (err) {
            //console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
        }
        if(deck){
            //console.log("Found: ", deck);

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

var addCardsToDeckLogged = function(req, res){
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
    //console.log("updateDeck");
    var db = req.db;
    var userId = req.userId;
    deck._id = new ObjectID(deck._id);
    deck.date = new Date();

    //console.log("Searching: ", deck);
    db.collection('decks').findOne({_id: deck._id, userId: deck.userId},function(err, result) {
          if (err) {
            db.close();
            //console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
          }
          if(result){
            //console.log("Found: ", result);
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
    deck.author = req.user.name;
    deck.date = new Date();

    //console.log("Inserting Deck: ",deck);
    db.collection('decks').insert(deck, function(err, newDeck) {
        if (err) {
            //console.log("Error inserting new deck: ", err, deck);
            res.sendStatus(500).end();
        } else if (newDeck) {
            //console.log('Added!', newDeck);
            res.status(201).json(newDeck).end();
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
    console.log("Searching decks");
    db.collection('decks').find({userId: userId}).toArray(function (err, decks) {
        console.log("Decks for user:", userId, " :", decks);
        res.status(200).json(decks).end();
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
    _id = new ObjectID(_id);
    var userId = req.userId;
    db.collection('decks').find({_id: _id, $or: [{privacy: "public"}, {userId: userId}] } ).toArray(function (err, decks) {
        if(err){
            console.log("Error searching deck, id:", _id);
            res.sendStatus(500);
            db.close();
        } else {
            if(decks){
                console.log("Deck:", decks[0]);
                res.status(200).json(decks[0]).end();
            } else{
                res.sendStatus(404);
            }
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

router.get('/:_id', function(req, res) {
    var _id = req.params._id;
    getDeckLogged(req, res,_id);
});

router.get('/:_id/', function(req, res) {
    var _id = req.params._id;
    getDeckLogged(req, res,_id);
});


/*
 * GET all decks.
 */

var getAllDecks = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('decks').find({$or: [{privacy: "public"}, {userId: userId}]}).toArray(function (err, items) {
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
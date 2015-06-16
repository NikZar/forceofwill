var express = require('express');
var router = express.Router();
ObjectID = require('mongoskin').ObjectID;

/*
    db.decks.find()
{ "_id" : ObjectId("548c53788b264500004980aa"), "title" : "Abdul Powa", "privacy" : "private", "cards" : [ { "card" : { "code" : "CMF-081 SR" }], "userId" : "10204933851969863", "date" : ISODate("2014-12-20T15:25:45.881Z"), "side" : [ { "card" : { "code" : "CMF-081 SR" }, "qty" : 3 }, { "card" : { "code" : "3-121 C" }, "qty" : 3 }, { "card" : { "code" : "CMF-071 R" }, "qty" : 4 }, { "card" : { "code" : "CMF-069 U" }, "qty" : 4 }, { "card" : { "code" : "CMF-067 C" }, "qty" : 3 }, { "card" : { "code" : "3-084 C" }, "qty" : 3 }, { "card" : { "code" : "2-073 SR" }, "qty" : 3 }, { "card" : { "code" : "1-146 SR" }, "qty" : 1 }, { "card" : { "code" : "2-125 C" }, "qty" : 3 }, { "card" : { "code" : "2-047 C" }, "qty" : 1 }, { "card" : { "code" : "2-110 SR" }, "qty" : 1 } ] }
*/

/*
 * DELETE a deck
 */

var deleteDeck = function(req, res, _id){
    var db = req.db;
    var userId = req.userId;
    _id = new ObjectID(_id);
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
        console.log("Authentication Error");
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

    db.collection('decks').findOne({_id: _id, userId: deck.userId},function(err, result) {
        if (err) {
            console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
        }
        if(deck){
            var deckDictionary = {};

            for (var i = 0; i < cards.length; i++) {
                cardsDictionary[cards[i].code] += cards[i].qty;
            };

            for (var i = 0; i < result.cards.length; i++) {
                deck.cards[i] += cardsDictionary[result.cards[i].code];
            };

            updateDeck(req, res, deck);
        } else {
            console.log("Authentication Error");
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
        console.log("Authentication Error");
        res.sendStatus(500);
    }
}

router.post('/:_id/cards', function(req, res) {
    addCardsToDeckLogged(req, res);
});
router.post('/:_id/cards/', function(req, res) {
    addCardsToDeckLogged(req, res);
});


var compressDeckCard = function(deckCard) {
    return {card: {code: deckCard.card.code, _id: deckCard.card._id}, qty: deckCard.qty};
}

/*
 * UPDATE a deck.
 */

var updateDeck = function(req, res, deck){
    //console.log("updateDeck");
    var db = req.db;
    var userId = req.userId;
    deck._id = new ObjectID(deck._id);
    deck.date = new Date();

    deck.cards = deck.cards.map(
        compressDeckCard
    );

    // console.log(deck.cards);

    deck.side = deck.side.map(
        compressDeckCard
    );

    db.collection('decks').findOne({_id: deck._id, userId: deck.userId},function(err, result) {
          if (err) {
            db.close();
            console.log("Error searching decks: ", err, user);
            res.sendStatus(500).end();
          }
          if(result){
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
        console.log("Authentication Error");
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

    db.collection('decks').insert(deck, function(err, newDeck) {
        if (err) {
            console.log(err);
            res.sendStatus(500).end();
        } else if (newDeck) {
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
        console.log("Authentication Error");
        res.sendStatus(500);
    }
}

router.post('', function(req, res) {
    addNewDeckLogged(req, res);
});
router.post('/', function(req, res) {
    addNewDeckLogged(req, res);
});

var getExpandedDecks = function(cards, decks){
    var cardsDictionary = {};

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        cardsDictionary[card._id] = card;
    };

    var expandedDecks = [];
    for (var i = decks.length - 1; i >= 0; i--) {
        var deck = decks[i];

        if(deck.privacy === "anonimous" && !req.user.isAdmin){
            delete deck.author;
        }

        deck.cards = deck.cards.map(
            function(deckCard){
                return {card: cardsDictionary[deckCard.card._id], qty: deckCard.qty}
            }
        );
        deck.side = deck.side.map(
            function(deckCard){
                return {card: cardsDictionary[deckCard.card._id], qty: deckCard.qty}
            }
        );

        expandedDecks.push(deck);
    }

    return expandedDecks;
}

var sendExpandedDecks = function (req, res, db, decks){
    var allDecksCardIDs = [];
    for (var i = decks.length - 1; i >= 0; i--) {
        var deck = decks[i];

        var cardsIDs = deck.cards.map(function(deckCard){
            return new ObjectID(deckCard.card._id);
        });

        var sideIDs = deck.side.map(function(deckCard){
            return new ObjectID(deckCard.card._id);
        });
        
        allDecksCardIDs = allDecksCardIDs.concat(cardsIDs, sideIDs);
    };

    var promiseCards = db.collection('cards').find({_id: {$in: allDecksCardIDs} }).toArrayAsync();
    promiseCards.then(function(cards){
        var expandedDecks = getExpandedDecks(cards, decks);
        res.status(200).json(expandedDecks).end();
        db.close();
    });
}
/*
 * GET all user decks.
 */
var getAllUserDecks = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('decks').find({userId: userId}).toArray(function (err, decks) {
        if(err){
            res.sendStatus(500);
        } else {
            sendExpandedDecks(req, res, db, decks);
        }
    });
}

var getAllUserDecksLogged = function(req, res){
    if(req.logged){
        getAllUserDecks(req, res);
    } else {
        console.log("Authentication Error");
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
var sendExpandedDeck = function (req, res, db, deck){
    var allDeckCardIDs = [];

    var cardsIDs = deck.cards.map(function(deckCard){
        return new ObjectID(deckCard.card._id);
    });

    var sideIDs = deck.side.map(function(deckCard){
        return new ObjectID(deckCard.card._id);
    });

    allDeckCardIDs = allDeckCardIDs.concat(cardsIDs, sideIDs);

    var promiseCards = db.collection('cards').find({_id: {$in: allDeckCardIDs} }).toArrayAsync();
    promiseCards.then(function(cards){
        var decks = [];
        decks.push(deck);
        var expandedDecks = getExpandedDecks(cards, decks);
        var expandedDeck = expandedDecks[0];

        if(expandedDeck.privacy === "anonimous" && !req.user.isAdmin){
            delete expandedDeck.author;
        }
        res.status(200).json(expandedDeck).end();
        db.close();
    });
}


var getDeck = function(req, res, _id){
    var db = req.db;
    _id = new ObjectID(_id);
    var userId = req.userId;
    db.collection('decks').find({_id: _id, $or: [{privacy: "public"},{privacy: "anonimous"}, {privacy: "link"}, {userId: userId}] } ).toArray(function (err, decks) {
        if(err){
            console.log("Error searching deck, id:", _id);
            res.sendStatus(500);
            db.close();
        } else {
            if(decks && decks.length > 0){
                sendExpandedDeck(req, res, db, decks[0]);
            } else{
                console.log("Deck not found, id:", _id);
                res.sendStatus(404);
                db.close();
            }
        }
    });
}

var getDeckLogged = function(req, res,_id){
    if(req.logged){
        getDeck(req, res,_id);
    } else {
        console.log("Authentication Error");
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
var getAllDecksAdmin = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('decks').find().toArray(function (err, decks) {
        if(err){
            console.log("Error Searching Decks");
            res.sendStatus(500);
        } else {
            sendExpandedDecks(req, res, db, decks);
        }
    });
}

var getAllDecks = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('decks').find({$or: [{privacy: "public"},{privacy: "anonimous"}, {userId: userId}]}).toArray(function (err, decks) {
        if(err){
            console.log("Error Searching Decks");
            res.sendStatus(500);
        } else {
            sendExpandedDecks(req, res, db, decks);
        }
    });
}

var getAllPublicDecks = function(req, res){
    var db = req.db;
    var userId = req.userId;
    db.collection('decks').find({$or: [{privacy: "public"},{privacy: "anonimous"}]}).toArray(function (err, decks) {
        if(err){
            console.log("Error Searching Decks");
            res.sendStatus(500);
        } else {
            sendExpandedDecks(req, res, db, decks);
        }
    });
}

var getAllDecksLogged = function(req, res){
    if(req.logged && req.user.isAdmin){
        getAllDecksAdmin(req, res);
    } else if(req.logged){
        getAllDecks(req, res);
    } else {
        getAllPublicDecks(req, res);
    }
}

router.get('', function(req, res) {
	getAllDecksLogged(req, res);
});

router.get('/', function(req, res) {
	getAllDecksLogged(req, res);
});

module.exports = router;
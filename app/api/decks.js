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


var compressDeckCard = function(deckCard) {
    console.log("Card code:", deckCard.card.code);
  return {card: {code: deckCard.card.code}, qty: deckCard.qty};
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

    console.log(deck.cards);

    deck.side = deck.side.map(
        compressDeckCard
    );

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

    db.collection('decks').insert(deck, function(err, newDeck) {
        if (err) {
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
        cardsDictionary[card.code] = card;
    };

    var expandedDecks = [];
    for (var i = decks.length - 1; i >= 0; i--) {
        var deck = decks[i];

        deck.cards = deck.cards.map(
            function(deckCard){
                return {card: cardsDictionary[deckCard.card.code], qty: deckCard.qty}
            }
        );
        deck.side = deck.side.map(
            function(deckCard){
                return {card: cardsDictionary[deckCard.card.code], qty: deckCard.qty}
            }
        );

        expandedDecks.push(deck);
    }

    return expandedDecks;
}

var sendExpandedDecks = function (req, res, db, decks){
    var allDecksCardCodes = [];
    for (var i = decks.length - 1; i >= 0; i--) {
        var deck = decks[i];

        var cardsCodes = deck.cards.map(function(deckCard){
            return deckCard.card.code;
        });

        var sideCodes = deck.side.map(function(deckCard){
            return deckCard.card.code;
        });

        allDecksCardCodes = allDecksCardCodes.concat(cardsCodes, sideCodes);
    };

    var promiseCards = db.collection('cards').find({code: {$in: allDecksCardCodes} }).toArrayAsync();
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
    var allDeckCardCodes = [];

    var cardsCodes = deck.cards.map(function(deckCard){
        return deckCard.card.code;
    });

    var sideCodes = deck.side.map(function(deckCard){
        return deckCard.card.code;
    });

    allDeckCardCodes = allDeckCardCodes.concat(cardsCodes, sideCodes);

    console.log(allDeckCardCodes);

    var promiseCards = db.collection('cards').find({code: {$in: allDeckCardCodes} }).toArrayAsync();
    promiseCards.then(function(cards){
        console.log("Cards:",cards);
        var decks = [];
        decks.push(deck);
        var expandedDecks = getExpandedDecks(cards, decks);
        res.status(200).json(expandedDecks[0]).end();
        db.close();
    });
}


var getDeck = function(req, res, _id){
    var db = req.db;
    _id = new ObjectID(_id);
    var userId = req.userId;
    db.collection('decks').find({_id: _id, $or: [{privacy: "public"}, {privacy: "link"}, {userId: userId}] } ).toArray(function (err, decks) {
        if(err){
            console.log("Error searching deck, id:", _id);
            res.sendStatus(500);
            db.close();
        } else {
            if(decks){
                sendExpandedDeck(req, res, db, decks[0]);
            } else{
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
    db.collection('decks').find({$or: [{privacy: "public"}, {userId: userId}]}).toArray(function (err, decks) {
        if(err){
            res.sendStatus(500);
        } else {
            sendExpandedDecks(req, res, db, decks);
        }
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
var express = require('express');
var router = express.Router();


/*
 * DELETE a deck
 */

var deleteDeck = function(req, res, _id){
    var userId = req.userId;
    db.collection('decks').remove({userId: userId, _id: _id}, function(err,result){
            if (err) {
                res.send(500).end();
            } else {
                res.send(200).end();
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
        res.send(500);
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

    console.log("Searching: ", deck);
    db.collection('decks').findOne({_id: deck._id, userId: deck.userId},function(err, result) {
        if (err) {
            console.log("Error searching decks: ", err, user);
            res.status(500).end();
        }
        if(result){
            console.log("Found: ", result);

            var deckDictionary = {};

            for (var i = 0; i < cards.length; i++) {
                cardsDictionary[cards[i].code] += cards[i].qty;
            };

            for (var i = 0; i < result.cards.length; i++) {
                result.cards[i] += cardsDictionary[result.cards[i].code];
            };

            console.log("Deck Cards: " , result.cards);

            res.status(200).end();
            db.close();
        } else {
            db.close();
            res.status(404).end();
        }
    });
}

var  addCardsToDeckLogged = function(req, res){
    if(req.logged){
        var cards = req.body;
        var _id = req.params._id;
        addCardsToDeck(req, res, cards, _id)
    } else {
        res.send(500);
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

    console.log("Searching: ", deck);
    db.collection('decks').findOne({_id: deck._id, userId: deck.userId},function(err, result) {
          if (err) {
            db.close();
            console.log("Error searching decks: ", err, user);
            res.status(500).end();
          }
          if(result){
            console.log("Found: ", result);
            db.collection('decks').update({_id: deck._id, userId: userId}, deck, function(err, result) {
                if(err){
                    res.status(500).end();
                }
                if(result){
                    res.status(200).end();
                } else {
                    res.status(500).end();
                }
                db.close();
            });
          } else {
            db.close();
            res.status(404).end();
          }
    });
}

var updateDeckLogged = function(req, res){
    if(req.logged){
        var deck = req.body;
        updateDeck(req, res, deck);
    } else {
        res.status(500);
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

    console.log("Inserting Deck: ",deck);
    db.collection('decks').insert(deck, function(err, result) {
        if (err) {
            console.log("Error inserting new deck: ", err, deck);
            res.status(500).end();
        }
        if (result) {
            console.log('Added!');
            res.status(201).end();
        }
        db.close();
    });
}

var addNewDeckLogged = function(req, res){
    if(req.logged){
        var deck = req.body;
        addNewDeck(req, res, deck);
    } else {
        res.status(500);
    }
}

router.post('', function(req, res) {
    addNewDeckLogged(req, res);
});
router.post('/', function(req, res) {
    addNewDeckLogged(req, res);
});


/*
 * GET a deck.
 */

var getDeck = function(req, res, _id){
    var db = req.db;
    db.collection('decks').find({_id: _id}).toArray(function (err, items) {
        if(err){
            res.status(500);
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
        res.status(500);
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
        res.status(500);
    }
}

router.get('', function(req, res) {
	getAllDecksLogged(req, res);
});

router.get('/', function(req, res) {
	getAllDecksLogged(req, res);
});

module.exports = router;
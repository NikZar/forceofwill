var express = require('express');
var router = express.Router();


/*
 * UPDATE a card.
 */

var updateCard = function(req, res, card){
    var db = req.db;
    var userId = req.userId;

    console.log("Searching: ", card);
    db.collection('cards').findOne({code: card.code, Type: card.Type},function(err, result) {
          if (err) {
            console.log("Error searching cards: ", err, user)
            res.status(500).end();
          }
          if(result){
            console.log("Found: ", result);
            db.collection('cards').update({code: card.code, Type: card.Type}, card, function(err, result) {
              if(err){
                res.status(500).end();
              }
              if(result){
                res.status(200).end();
              } else {
                res.status(500).end();
              }
            });
          } else {
            res.status(404).end();
          }
    });
}

var updateCardLoggedAdmin = function(req, res){
  if(req.logged && req.user.isAdmin){
    var card = req.body;
    updateCard(req, res, card);
  } else {
    res.status(500);
  }
}

router.put('', function(req, res) {
  updateCardLoggedAdmin(req, res)
});
router.put('/', function(req, res) {
	updateCardLoggedAdmin(req, res)
});


/*
 * ADD a new card.
 */

var addNewCard = function(req, res, card){
  var db = req.db;
  var userId = req.userId;

  console.log("Searching: ", card);
  db.collection('cards').findOne({code: card.code, Type: card.Type},function(err, result) {
        if (err) {
          console.log("Error searching cards: ", err, user);
          res.status(500).end();
        }
        if(result){
          console.log("Found: ", result);
          res.status(500).end();
        } else {
          console.log("Inserting Card: ",card);
          db.collection('cards').insert(card, function(err, result) {
            if (err) {
              console.log("Error inserting new card: ", err, card);
              res.status(500).end();
            }
            if (result) {
              console.log('Added!');
              res.status(201).end();
            }
          });
        }
  });
}

var addNewCardLoggedAdmin = function(req,res){
  if(req.logged && req.user.isAdmin){
    var card = req.body;
    addNewCard(req, res, card);
  } else {
    res.status(500);
  }
}

router.post('', function(req, res) {
  addNewCardLoggedAdmin(req,res);
});
router.post('/', function(req, res) {
	addNewCardLoggedAdmin(req,res);
});


/*
 * GET all cards with input attribute.
 */

var getCardsWithAttribute = function(req,res){
  var db = req.db;
  var attribute = req.params.attribute;
  db.collection('cards').find({Attribute: attribute}).toArray(function (err, items) {
      if (err) {
        res.status(500).end();
      } else{
        res.json(items);
      }
      db.close();
  });
}

router.get('/attribute/:attribute', function(req, res) {
	getCardsWithAttribute(req, res);
});

router.get('/attribute/:attribute', function(req, res) {
	getCardsWithAttribute(req, res);
});


/*
 * GET all card FAQ.
 */

var getCardFAQ = function(req,res,code){
  var db = req.db;
  db.collection('faq').find({cards: { $in: [code] } }).toArray(function (err, items) {
    if (err) {
      res.status(500).end();
    } else {
      res.json(items);
    }
    db.close();
  });
}

router.get('/:code/faq', function(req, res) {
  var code = req.params.code;
  getCardFAQ(req, res, code);
});

router.get('/:code/faq/', function(req, res) {
  var code = req.params.code;
  getCardFAQ(req, res, code);
});

/*
 * GET a card.
 */

var getCard = function(req,res,code){
  var db = req.db;
  db.collection('cards').find({code: code}).toArray(function (err, items) {
    //Rulers Code corresponds to two cards
    if (err) {
      res.status(500).end();
    } else {
      res.json(items);
    }
    db.close();
  });
}

router.get('/:code', function(req, res) {
	var code = req.params.code;
	getCard(req, res, code);
});

router.get('/:code/', function(req, res) {
	var code = req.params.code;
	getCard(req, res, code);
});


/*
 * GET all cards.
 */

var getAllCards = function(req, res){
  var db = req.db;
  db.collection('cards').find().toArray(function (err, items) {
    if (err) {
      res.status(500).end();
    } else {
      res.json(items);  
    }     
    db.close();
  });
}

router.get('', function(req, res) {
	getAllCards(req, res);
});

router.get('/', function(req, res) {
	getAllCards(req, res);
});

module.exports = router;
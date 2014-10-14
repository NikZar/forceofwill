var express = require('express');
var router = express.Router();


var getAllCards = function(req, res){
    var db = req.db;
    //console.log("Getting all cards");
    db.collection('cards').find().toArray(function (err, items) {
    	if (err) {
			res.send(500).end();
		}
        res.json(items);       
	    db.close();
    });
}

var getCard = function(req,res){
    var db = req.db;
	var code = req.params.code;
	//console.log("Getting card: ",code);
	db.collection('cards').find({Code: code}).toArray(function (err, items) {
		//Rulers Code corresponds to two cards
		if (err) {
			res.send(500).end();
		}
        res.json(items);
	    db.close();
    });
}

var getCardsWithAttribute = function(req,res){
    var db = req.db;
	var attribute = req.params.attribute;
	db.collection('cards').find({Attribute: attribute}).toArray(function (err, items) {
        if (err) {
			res.send(500).end();
		}
		res.json(items);
    });
    db.close();
}

/*
 * GET all cards with input attribute.
 */
router.get('/attribute/:attribute', function(req, res) {
	getCardsWithAttribute(req, res);
});

router.get('/attribute/:attribute', function(req, res) {
	getCardsWithAttribute(req, res);
});
/*
 * GET a card.
 */
router.get('/:code', function(req, res) {
	getCard(req, res);
});

router.get('/:code/', function(req, res) {
	getCard(req, res);
});
/*
 * GET all cards.
 */
router.get('', function(req, res) {
	getAllCards(req, res);
});

router.get('/', function(req, res) {
	getAllCards(req, res);
});

module.exports = router;
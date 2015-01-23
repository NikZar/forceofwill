var express = require('express');
var router = express.Router();

/*
 * DELETE a FAQ
 */

var deleteFAQ = function(req, res, _id){
    var db = req.db;
    var userId = req.userId;
    _id = new ObjectID(_id);
    db.collection('faq').remove({_id: _id}, function(err,result){
            if (err) {
                res.sendStatus(500).end();
            } else {
                res.sendStatus(200).end();
            }
            db.close();
        }
    );      
}

var deleteFAQLoggedAdmin = function(req, res){
    if(req.logged && req.user.isAdmin){
        var _id = req.params._id;
        deleteFAQ(req, res, _id);
    } else {
        res.sendStatus(500);
    }
}

router.delete('/:_id', function(req, res) {
    deleteFAQLoggedAdmin(req, res);
});
router.delete('/:_id/', function(req, res) {
    deleteFAQLoggedAdmin(req, res);
});

/*
 * UPDATE a FAQ.
 */

var updateFAQ = function(req, res, faq){
    var db = req.db;
    var userId = req.userId;
    var faqID = new ObjectID(faq._id);
    db.collection('faq').findOne({_id: faqID},function(err, result) {
          if (err) {
            res.status(500).end();
          }
          if(result){
            db.collection('faq').update({_id: faqID}, faq, function(err, result) {
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

var updateFAQLoggedAdmin = function(req, res){
  if(req.logged && req.user.isAdmin){
    var faq = req.body;
    updateFAQ(req, res, faq);
  } else {
    res.status(500);
  }
}

router.put('', function(req, res) {
  	updateFAQLoggedAdmin(req, res)
});
router.put('/', function(req, res) {
	updateFAQLoggedAdmin(req, res)
});


/*
 * ADD a new FAQ.
 */

var addNewFAQ = function(req, res, faq){
	var db = req.db;
	var userId = req.userId;
	faq.userId = userId;
	faq.author = req.user.name;

	db.collection('faq').insert(faq, function(err, result) {
		if (err) {
		  res.status(500).end();
		}
		if (result) {
		  res.status(201).end();
		}
	});

}

var addNewFAQLoggedAdmin = function(req,res){
  if(req.logged && req.user.isAdmin){
    var faq = req.body;
    addNewFAQ(req, res, faq);
  } else {
    res.status(500);
  }
}

router.post('', function(req, res) {
  	addNewFAQLoggedAdmin(req,res);
});
router.post('/', function(req, res) {
	addNewFAQLoggedAdmin(req,res);
});


/*
 * GET a FAQ
 */
var getFAQ = function(req,res,_id){
  var db = req.db;
  _id = new ObjectID(_id);
  db.collection('faq').find({_id: _id}).toArray(function (err, items) {
    //Rulers Code corresponds to two cards
    if (err) {
      res.status(500).end();
    } else {
    	if(items && items.length > 0){
      		res.json(items[0]);
    	}
    	res.status(404).end();
    }
    db.close();
  });
}

router.get('/:id', function(req, res) {
	var _id = req.params.id;
	getFAQ(req, res, _id);
});

router.get('/:id/', function(req, res) {
	var _id = req.params.code;
	getFAQ(req, res, _id);
});


/*
 * GET all FAQ.
 */

var getExpandedFAQs = function(cards, faqs){
    var cardsDictionary = {};

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        cardsDictionary[card._id] = card;
    };

    var expandedFAQs = [];
    for (var i = faqs.length - 1; i >= 0; i--) {
        var faq = faqs[i];

        faq.cards = faq.cards.map(
            function(card){
                return cardsDictionary[card._id];
            }
        )

        expandedFAQs.push(faq);
    }

    return expandedFAQs;
}

var sendExpandedFAQs = function (req, res, db, faqs){
    var allFAQsCardIDs = [];
    for (var i = faqs.length - 1; i >= 0; i--) {
        var faq = faqs[i];

        var cardsIDs = faq.cards.map(function(card){
            return new ObjectID(card._id);
        });
        
        allFAQsCardIDs = allFAQsCardIDs.concat(cardsIDs);
    };

    var promiseCards = db.collection('cards').find({_id: {$in: allFAQsCardIDs} }).toArrayAsync();
    promiseCards.then(function(cards){
        var expandedFAQs = getExpandedFAQs(cards, faqs);
        res.status(200).json(expandedFAQs).end();
        db.close();
    });
}

var getAllFAQ = function(req, res){
  var db = req.db;
  db.collection('faq').find().toArray(function (err, faqs) {
    if (err) {
      res.status(500).end();
      db.close();
    } else {
      sendExpandedFAQs(req, res, db, faqs);  
    }     
  });
}

router.get('', function(req, res) {
	getAllFAQ(req, res);
});

router.get('/', function(req, res) {
	getAllFAQ(req, res);
});

module.exports = router;
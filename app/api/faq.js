var express = require('express');
var router = express.Router();


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

var getAllFAQ = function(req, res){
  var db = req.db;
  db.collection('faq').find().toArray(function (err, items) {
    if (err) {
      res.status(500).end();
    } else {
      res.json(items);  
    }     
    db.close();
  });
}

router.get('', function(req, res) {
	getAllFAQ(req, res);
});

router.get('/', function(req, res) {
	getAllFAQ(req, res);
});

module.exports = router;
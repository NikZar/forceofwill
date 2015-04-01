var express = require('express');
var router = express.Router();

/*
 * GET a lackey cards
*/

var getCardTXT = function(req,res){
  var db = req.db;
  db.collection('cards').find().toArray(function (err, items) {
    if (err) {
      res.status(500).end();
    } else {
    	if(items && items.length > 0){
      	res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.write("Name\tSet\tImageFile\tCost\tAttribute\tType\tATK\tDEF\tCardtext\n");
        items.map(
          function(card){
            res.write(card.Name+"\t"+card.Set+"\t"+card["Image path"]+"\t"+card["Total Cost"]+"\t"+card.Attribute+"\t"+card.Type+"\t"+card.ATK+"\t"+card.DEF+"\t"+card.Cardtext+"\n");
          }
        );
        res.end();
    	}
    	res.status(404).end();
    }
    db.close();
  });
}
 
router.get('/carddata.txt', function(req, res) {
	getCardTXT(req, res);
});


/*
 * GET a lackey images path
*/

var getCardIMAGES = function(req,res){
  var db = req.db;
  db.collection('cards').find().toArray(function (err, items) {
    if (err) {
      res.status(500).end();
    } else {
      if(items && items.length > 0){
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.write("CardImageURLs:\n");
        items.map(
          function(card){
            res.write(card["Image path"]+"\t"+"http://www.fowtools.com/images"+card["Image path"]+"\n");
          }
        );
        res.end();
      }
      res.status(404).end();
    }
    db.close();
  });
}
 
router.get('/cardimages.txt', function(req, res) {
  getCardIMAGES(req, res);
});

module.exports = router;
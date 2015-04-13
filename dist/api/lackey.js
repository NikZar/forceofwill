var express = require('express');
var router = express.Router();

/*
 * GET lackey cards
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
 * GET lackey images path
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

// GET lackey Deck

var sendDeckLackeyXML = function(res, deck){
    var filename = deck.title.replace(/ /g,"_") + ".dek";
    res.writeHead(200, {
        "Content-Disposition": 'attachment; filename="'+filename+'"',
        'Content-Type': 'text/plain'
    });
    res.write('<deck version="0.8">\n');
    res.write("\t<meta>\n\t\t<game>ForceOfWill</game>\n\t</meta>\n");
    res.write('\t<superzone name="Ruler">\n');
    res.write('\t\t<card><name id="'+deck.ruler.code +'">'+deck.ruler.Name+'</name><set>'+deck.ruler.Set+'</set></card>\n');
    // items.map(
    //   function(card){
    //     res.write(card.Name+"\t"+card.Set+"\t"+card["Image path"]+"\t"+card["Total Cost"]+"\t"+card.Attribute+"\t"+card.Type+"\t"+card.ATK+"\t"+card.DEF+"\t"+card.Cardtext+"\n");
    //   }
    // );
    res.write('\t</superzone>\n');
    res.write('\t<superzone name="Deck">\n');
    // items.map(
    //   function(card){
    //     res.write(card.Name+"\t"+card.Set+"\t"+card["Image path"]+"\t"+card["Total Cost"]+"\t"+card.Attribute+"\t"+card.Type+"\t"+card.ATK+"\t"+card.DEF+"\t"+card.Cardtext+"\n");
    //   }
    // );
    res.write('\t</superzone>\n');
    res.write('\t<superzone name="Stone deck">\n');
    // items.map(
    //   function(card){
    //     res.write(card.Name+"\t"+card.Set+"\t"+card["Image path"]+"\t"+card["Total Cost"]+"\t"+card.Attribute+"\t"+card.Type+"\t"+card.ATK+"\t"+card.DEF+"\t"+card.Cardtext+"\n");
    //   }
    // );
    res.write('\t</superzone>\n');
    res.write('</deck>');
    res.end();
}

var strictMatch =  function(text, textToSearch){
  if(text && textToSearch){
    return ( text.toUpperCase().indexOf(textToSearch.toUpperCase()) > -1 );
  } else{
    return false;
  }
}

var filterOnText = function(cardList, key, filterString, remaining){
  if(filterString === "" || filterString === "radio_all"){
    return cardList;
  } 
  else if(cardList){

    return cardList.filter(
      
      function(deckCard){
        //console.log(card);
        if(deckCard && deckCard.card && strictMatch(deckCard.card[key], filterString) ){
          return true;
        } else if(remaining){ 
          remaining.push(deckCard);
        }
        
        return false; 
      }
    
    );
  } else {
    return [];
  }
}

var sendDeckLackey = function(res, deck){
    var filename = deck.title.replace(/ /g,"_") + ".txt";
    res.writeHead(200, {
        "Content-Disposition": 'attachment; filename="'+filename+'"',
        'Content-Type': 'text/plain'
    });

    //DECK
    var rulers = filterOnText(deck.cards, "Type", "Ruler");
    var resonators = filterOnText(deck.cards, "Type", "Resonator");
    var additions = filterOnText(deck.cards, "Type", "Addition");
    var spells = filterOnText(deck.cards, "Type", "Spell");
    var stones = filterOnText(deck.cards, "Type", "Stone");

    rulers.map(function(deckCard){
      res.write(deckCard.qty +"\t"+deckCard.card.Name+"\n");
    });
    res.write("Deck:\n");
    resonators.map(function(deckCard){
      res.write(deckCard.qty +"\t"+deckCard.card.Name+"\n");
    });
    additions.map(function(deckCard){
      res.write(deckCard.qty +"\t"+deckCard.card.Name+"\n");
    });
    spells.map(function(deckCard){
      res.write(deckCard.qty +"\t"+deckCard.card.Name+"\n");
    });

    res.write("Stone deck:\n");
    stones.map(function(deckCard){
      res.write(deckCard.qty +"\t"+deckCard.card.Name+"\n");
    });
    
    
    res.end();
}

var getExpandedDecks = function(cards, decks){
    var cardsDictionary = {};

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        cardsDictionary[card._id] = card;
    };

    var expandedDecks = [];
    for (var i = decks.length - 1; i >= 0; i--) {
        var deck = decks[i];

        if(deck.privacy === "anonimous"){
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

var sendExpandedLackeyDeck = function (req, res, db, deck){
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

        if(expandedDeck.privacy === "anonimous"){
            delete expandedDeck.author;
        }

        sendDeckLackey(res, expandedDeck);
        db.close();
    });
}


var getDeckLackey = function(req, res, _id){
    var db = req.db;
    _id = new ObjectID(_id);
    var userId = req.userId;
    db.collection('decks').find({_id: _id, $or: [{privacy: "public"},{privacy: "anonimous"}, {privacy: "link"}, {userId: userId}] } ).toArray(function (err, decks) {
        if(err){
            console.log("Error searching deck, id:", _id);
            res.sendStatus(500);
            db.close();
        } else {
            if(decks){
                sendExpandedLackeyDeck(req, res, db, decks[0]);
            } else{
                res.sendStatus(404);
                db.close();
            }
        }
    });
}

var getDeckLackeyLogged = function(req, res,_id){
    if(req.logged){
        getDeckLackey(req, res,_id);
    } else {
        console.log("Authentication Error");
        res.sendStatus(500);
    }
}

router.get('/decks/:_id', function(req, res) {
    var _id = req.params._id;
    getDeckLackeyLogged(req, res,_id);
});

router.get('/decks/:_id/', function(req, res) {
    var _id = req.params._id;
    getDeckLackeyLogged(req, res,_id);
});

module.exports = router;
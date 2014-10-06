var express = require('express');
var router = express.Router();
var https = require('https');

// route middleware to validate :token
router.param('token', function(req, res, next, token) {

	//Doing token validations on :token
	var callback = function(response) {
	  
	  var str = '';
	  response.on('data', function (chunk) {
	    str += chunk;
	  });
	  response.on('end', function () {
	    var fbauth = JSON.parse(str);
		// go to the next thing
		if(fbauth.id){
			// once validation is done save the new item in the req
			req.token = token;
			// retrieving id parameter
			req.id = fbauth.id;
			next();
		}
	  });
	}

	//Checking FB API for token correctness
	//https://graph.facebook.com/me?access_token={accessToken}
	var options = {
	  host: 'graph.facebook.com',
	  path: '/me?access_token='+token,
	  method: 'GET'
	};

	https.request(options, callback).end();

});

/*
/*
 * GET cards.
 */
router.get('/:token/', function(req, res) {
	console.log("User ID: ", req.id);
    var db = req.db;
    db.collection('cards').find().toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;
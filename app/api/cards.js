var express = require('express');
var router = express.Router();
var https = require('https');

// route middleware to validate :token
router.param('token', function(req, res, next, token) {

	//Options and callbacks for token validation

	var checkAppId = function(response) {
	  
	  var str = '';
	  response.on('data', function (chunk) {
	    str += chunk;
	  });
	  response.on('end', function () {
	  	console.log(str);
	    var fbauth = JSON.parse(str);

	    //validation
		if(fbauth.id === "716407968436535" || fbauth.id === "568442163257885"){
			req.token = token;
			// retrieving app id parameter for future use
			req.appId = fbauth.id;
			next();
		}
	  });
	}

	//https://graph.facebook.com/app?access_token={accessToken}
	var appIdOptions = {
	  host: 'graph.facebook.com',
	  path: '/app?access_token='+token,
	  method: 'GET'
	};

	var getUserId = function(response) {
	  
	  var str = '';
	  response.on('data', function (chunk) {
	    str += chunk;
	  });
	  response.on('end', function () {
	    var fbauth = JSON.parse(str);

	    //validation
		if(fbauth.id){
			// retrieving user id parameter for future use
			req.userId = fbauth.id;
			https.request(appIdOptions, checkAppId).end();
		}
	  });
	}

	//Checking FB API for token correctness
	//https://graph.facebook.com/me?access_token={accessToken}
	var userIdOptions = {
	  host: 'graph.facebook.com',
	  path: '/me?access_token='+token,
	  method: 'GET'
	};

	https.request(userIdOptions, getUserId).end();

});

/*
 * GET cards.
 */
router.get('/:token/', function(req, res) {
	console.log("User ID: ", req.userId);
	console.log("App ID: ", req.appId);
    var db = req.db;
    db.collection('cards').find().toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;
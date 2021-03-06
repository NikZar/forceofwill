require('newrelic');
var gzippo = require('gzippo');
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var https = require('https');
var Promise = require("bluebird");
var apn = require('apn');
var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

// Database
var mongo = require('mongoskin');

// Promisfy Mongoskin Calls
Object.keys(mongo).forEach(function(key) {
  var value = mongo[key];
  if (typeof value === "function") {
    Promise.promisifyAll(value);
    Promise.promisifyAll(value.prototype);
  }
});
Promise.promisifyAll(mongo);

switch(process.env.NODE_ENV){

        case 'production':
        	var BASEDIR = "/dist";
          var apnOptions = { 
            cert: "certificates/production/production.pem",
            key: "certificates/production/production_key.pem"
          };
          break;
        
        default:
          var BASEDIR = "/app";
          var apnOptions = { 
            cert: "certificates/development/development.pem",
            key: "certificates/development/development_key.pem"
          };
          break;
			
}

var apnConnection = new apn.Connection(apnOptions);

var checkToken = function(req,res,next,token){

    //Options and callbacks for token validation
    var checkAppId = function(response) {
      
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        //console.log(str);
        var fbauth = JSON.parse(str);

        //validation
        if(fbauth.id === "716407968436535" || fbauth.id === "568442163257885"){
            req.token = token;
            // retrieving app id parameter for future use
            req.appId = fbauth.id;
            req.logged = true;
            next();
        } else {
            req.logged = false;
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
        req.user = fbauth;
        //validation
        if(fbauth.id){
            // retrieving user id parameter for future use
            req.userId = fbauth.id;
            https.request(appIdOptions, checkAppId).end();
        } else {
            req.logged = false;
            next();
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
}

// Authenticate user at each request
app.use("/api",function(req,res,next){
    var token = req.query.token;
    //console.log("Token: ",token);
    checkToken(req,res,next, token);
});

// Create/Update User
app.use("/api",function(req,res,next){
    //Open DB connection
    //console.log("Opening connection...");
    switch(process.env.NODE_ENV){

      case 'production':
        var DBURL = "lennon.mongohq.com:10041/app30136505";
        var USERNAME = "niko";
        var PASSWORD = "bambumbim";
        var db = mongo.db("mongodb://"+USERNAME+":"+PASSWORD+"@"+DBURL, {native_parser:true, auto_reconnect: false, poolSize: 5});
        break;
      
      default:
        var DBURL = "localhost:27017/app30136505";
        var db = mongo.db("mongodb://"+DBURL, {native_parser:true, auto_reconnect: false, poolSize: 5});
        break;
          
    }
    // making db available to other routers
    req.db = db;
    if(req.logged){
      var userId = req.userId;
      var user = req.user;
      var db = req.db;

      //console.log("Searching: ", userId);
      db.collection('users').findOne({id: userId},function(err, result) {
            if (err) {
              //console.log("Error searching user: ", err, user)
            }
            if(result){
              req.user = result;
              //console.log("Found: ", result);
            } else {
              //console.log("Inserting User: ",user);
              db.collection('users').insert(user, function(err, result) {
                if (err) {
                  //console.log("Error inserting new user: ", err, user)
                }
                if (result) {
                  //console.log('Added!');
                }
              });
            }
            //console.log("Next! ", userId);
            next();
      });
    } else {
      next();
    }
});

// API
//	CARDS
var cards = require("" + __dirname +BASEDIR+'/api/cards');
app.use('/api/cards', cards);
//  DECKS
var decks = require("" + __dirname +BASEDIR+'/api/decks');
app.use('/api/decks', decks);
//  BINDERS
var binders = require("" + __dirname +BASEDIR+'/api/binders');
app.use('/api/binder/cards', binders);
//  CARDS
var faq = require("" + __dirname +BASEDIR+'/api/faq');
app.use('/api/faq', faq);
//  DEVICES
var devices = require("" + __dirname +BASEDIR+'/api/devices');
app.use('/api/devices', devices);

//  LACKEY
var lackey = require("" + __dirname +BASEDIR+'/api/lackey');
app.use('/api/lackey', lackey);

app.use(morgan('dev'));
app.use(gzippo.staticGzip("" + __dirname + BASEDIR));
app.listen(process.env.PORT || 5000);
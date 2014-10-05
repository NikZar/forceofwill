var gzippo = require('gzippo');
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var app = express();
app.use(cors());

// Database
var mongo = require('mongoskin');

switch(process.env.NODE_ENV){

        case 'production':
        	var BASEDIR = "/dist";
            var DBURL = "lennon.mongohq.com:10041/app30136505";
			var USERNAME = "niko";
			var PASSWORD = "bambumbim";
			var db = mongo.db("mongodb://"+USERNAME+":"+PASSWORD+"@"+DBURL, {native_parser:true});
			break;
        
        default:
        	var BASEDIR = "/app";
            var DBURL = "localhost:27017/app30136505";
			var db = mongo.db("mongodb://"+DBURL, {native_parser:true});
			break;
			
}

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
// API
//	CARDS
var cards = require("" + __dirname +BASEDIR+'/api/cards');
app.use('/cards', cards);

app.use(morgan('dev'));
app.use(gzippo.staticGzip("" + __dirname + BASEDIR));
app.listen(process.env.PORT || 5000);

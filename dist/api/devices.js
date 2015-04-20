var express = require('express');
var router = express.Router();


var updateDevice = function(req, res, deviceInfo){
	var db = req.db;
    var userId = req.userId;

	db.collection('devices').update(
		{ 
			userId: userId 
		},
		deviceInfo,
		{
			upsert: true
		},
		function(err, result) {
		    if(err){
		        res.sendStatus(500).end();
		    }
		    if(result){
		        res.sendStatus(200).end();
		    } else {
		        res.sendStatus(500).end();
		    }
		    db.close();
		}
    );
}

var updateDeviceLogged = function(req, res){
    if(req.logged){
        var deviceInfo = req.body;
        updateDevice(req, res, deviceInfo);
    } else {
        console.log("Authentication Error");
        res.sendStatus(500);
    }
}

router.put('', function(req, res) {
    updateDeviceLogged(req, res);
});
router.put('/', function(req, res) {
    updateDeviceLogged(req, res);
});

module.exports = router;
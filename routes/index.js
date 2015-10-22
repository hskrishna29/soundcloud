var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var app = express();
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', function(req,res,next){
var clientId = 'b164557c5de985740b81128bce5e1b60';
res.render('home', {title : 'Hi!' , client_id : clientId});

});

router.get('/callback', function(req,res,next){
res.render('callback', {title : 'Callback'});

});

app.use(express.static(__dirname + '/public'));	

app.listen(8000);

module.exports = router;

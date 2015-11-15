var express = require('express');
var mysql = require('mysql');
var app = express();

app.set('port', (process.env.PORT || 5000));

var connection = mysql.createConnection({
	host	: 'steamgame.c7tcssw8uobt.us-east-1.rds.amazonaws.com',
	user	: 'SteamGame', 
	password: 'steamgame',
	port 	: '3306'
});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



var $ = require('jquery')(require("jsdom").jsdom().defaultView);
var http = require('http');
var express = require('express');
var mysql = require('mysql');
var app = express();
var request = require('request'),
		cheerio = require('cheerio'),
		appidList = [];
var wishlistURL;

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

//root redirects to login page
app.get('/', function(request, response) {
  response.render('pages/login');
	//$("body").append("<div>TEST</div>");
	//console.log($("h2").html());

});

//routes to the main dashboard page
app.get('/index', function (request, response) {
	 response.render('pages/index');
});

//wildcard (if nothing matches)
app.get('*', function (req, res) {
	res.send('Bad Route: URL does not exist');

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

/***************** CUSTOM METHODS BELOW ***********************/
/*GET RID OF HARD CODING ONCE USER INPUT IS FIGURED OUT*/
wishlistURL = 'http://steamcommunity.com/id/T1War/wishlist/';
request(wishlistURL, function(err, resp, body){
	if(!err && resp.statusCode == 200){
		var $ = cheerio.load(body);
		$('div.wishlistRow').each(function(){
			var appid = $(this).attr('id');
			appid = appid.replace("game_", "");
			appidList.push(appid);
		});

		//prints wishlist
		//console.log(appidList);
	}
});

connection.connect();

var query = connection.query('SELECT * FROM SteamGame.tags', function(err, result, fields){
	if(err) throw err;
		//console.log('result:', result);
});

connection.end();



var $ = require('jquery')(require("jsdom").jsdom().defaultView);
var http = require('http');
var express = require('express');
var squel = require("squel");
var mysql = require('mysql');
var app = express();

var request = require('request'),
		cheerio = require('cheerio');

//global variable that should hold user wishlist
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

//wildcard (if nothing matches)
app.get('*', function (req, res) {
	res.send('Bad Route: URL does not exist');

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

/***************** CUSTOM METHODS BELOW ***********************/
/*creates a variable in the locals, so it can be accessed in all the views*/
//app.locals.appdata = appidList;
//var a = "daad"
//global._appidList.push(a);
/*GET RID OF HARD CODING ONCE USER INPUT IS FIGURED OUT*/

wishlistURL = 'http://steamcommunity.com/id/T1War/wishlist/';
/*gets the user wishlist url and parses the user's wishlist for the game's appID*/

app.get('/index', function (request, response) {
	connection.query('SELECT * FROM SteamGame.wishlistdata',function(err, result){
		if(err) throw err;
		console.log('result:', result);
		response.render('pages/index', {result:result});
	});
});

request(wishlistURL, function(err, resp, body){
	//console.log(appidList);
	var appid;
	//var appidList = [];
	if(!err && resp.statusCode == 200){
		var $ = cheerio.load(body);
		$('div.wishlistRow').each(function(){
			appid = $(this).attr('id');
			appid = appid.replace("game_", "");

			connection.query('INSERT INTO SteamGame.userWishlistTemp SET AppID=?', appid ,function(err, result){
				if(err) throw err;
				console.log('result:', result);
			});

		}); /*end of each function*/


	}
});





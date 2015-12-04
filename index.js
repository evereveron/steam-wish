var $ = require('jquery');
var http = require('http');
var express = require('express');
var squel = require("squel");
var mysql = require('mysql');
var app = express();

var request = require('request'),
		cheerio = require('cheerio');

//global variable that should hold user wishlist
var wishlistURL;
global.url;
app.set('port', (process.env.PORT || 5000));

var connection = mysql.createConnection({
	host	: 'steamgame.c7tcssw8uobt.us-east-1.rds.amazonaws.com',
	user	: 'SteamGame',
	password: 'steamgame',
	port 	: '3306',
	database: 'SteamGame'
});

connection.connect();

connection.query('SELECT * from tags', function(err, rows, fields) {
	if(!err)
		console.log(rows);
	else{
		console.log('Error while performing query');
		throw err;
	}
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
/*
 app.get('*', function (req, res) {
 res.send('Bad Route: URL does not exist');

 });
 */
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

global.pageSize;
global.pageCount;

global.totalGames;
global.currentPage;
app.get('/index', function (request, response) {

	global.pageSize = 100;
	console.log("total games: " + global.totalGames);
	global.pageCount = global.totalGames/global.pageSize;

	console.log("Page count: " + global.pageCount);
	global.currentPage = 1;
	var gameArray = [];
	if (typeof request.query.page !== 'undefined') {
		global.currentPage = +request.query.page;
	}
	connection.query('SELECT * FROM SteamGame.wishlistdata',function(err, result){
		response.render('pages/index', {
			result: result,
			pageSize: pageSize,
			pageCount: pageCount,
			currentPage: currentPage
		});
	});
}); /*end of app.get '/' */
var url;
app.post('/', function (request, response) {
	global.url = request.body.urlName || "http://steamcommunity.com/id/T1War/wishlist/";
});

/*
 app.get('/index/:page', function (request, response) {

 });
 */
global.insertQ;
request(wishlistURL, function(err, resp, body){
	//console.log(appidList);
	var appid;
	//var appidList = [];
	global.insertQ = 'INSERT IGNORE INTO SteamGame.userWishlistTemp VALUES ' || console.log(err);

	if(!err && resp.statusCode == 200){
		var $ = cheerio.load(body);
		$('div.wishlistRow').each(function(){
			appid = $(this).attr('id');
			appid = appid.replace("game_", "");
			global.insertQ = global.insertQ + '(' + appid + '),';

		}); /*end of each function*/
		global.insertQ = global.insertQ.slice(0,-1);

		//console.log(global.insertQ);

		connection.query(global.insertQ ,function(err, result){
			if(err) throw err;
			//console.log('result:', result);
		});

	}

	connection.query('SELECT COUNT(*) as total FROM SteamGame.wishlistdata', function(err, count){
		global.totalGames = count[0].total;
		console.log("count: " + count[0].total);
	});

});





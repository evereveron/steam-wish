var $ = require('jquery')(require("jsdom").jsdom().defaultView);
var http = require('http');
var express = require('express');
var mysql = require('mysql');
var app = express();
var request = require('request'),
		cheerio = require('cheerio'),
		fs = require('fs'),
		appidList = [];

app.set('port', (process.env.PORT || 5000));

var connection = mysql.createConnection({
	host	: 'steamgame.c7tcssw8uobt.us-east-1.rds.amazonaws.com',
	user	: 'SteamGame',
	password: 'steamgame',
	port 	: '3306'
});

/*
//JQuery Example Use
var options = {
	host: 'store.steampowered.com',
	port: 80,
	path: '/'
};

var html = '';
http.get(options, function(res) {
	//$("body").append("<div>TEST</div>");
	console.log($("menuitem").html());
	});
*/

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//wildcard (if nothing matches)
app.get('*', function (req, res) {
	res.send('Bad Route: URL does not exist');

});

/*GET RID OF HARD CODING ONCE USER INPUT IS FIGURED OUT*/
request('http://steamcommunity.com/id/T1War/wishlist/', function(err, resp, body){
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

/*
request('http://www.reddit.com', function(err, resp, body){
	if(!err && resp.statusCode == 200){
		var $ = cheerio.load(body);
		$('a.title', '#siteTable').each(function(){
			var url = $(this).attr('href');
			if(url.indexOf('i.imgur.com') != -1){
				urls.push(url);
			}
		});

		console.log(urls);
	}
});
*/

/*ATTEMPT AT GETTING USER INPUT---FIGURE OUT HOW TO DO LATER*/
/*
app.post("/", function(req){
	console.log("hello");
	var urlName = req.body.url;
	request(urlName, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			alert(urlName);
			var $ = cheerio.load(body);
			$('h4.ellipsis').each(function(){
				urls.push(url);
			});
		}
		console.log(urls);
	});
});
*/


//app.use(express.bodyParser());

/*app.post("/", function(request, response){
	console.log(request.body.urlName);
	//console.log(request.body.user.email);
});*/



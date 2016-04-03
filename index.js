var $ = require('jquery');
var http = require('http');
var express = require('express');
var squel = require("squel");
var mysql = require('mysql');
var app = express();

var request = require('request'),
		cheerio = require('cheerio');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var session = require('express-session');
app.use(session({
	secret: 'i love horses',
	resave: false,
	saveUnitialized: true
}));



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
	/*if(!err)
		console.log(rows);
	else{
		console.log('Error while performing query');
		throw err;
	}*/
});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//root redirects to login page
app.get('/', function(request, response) {
	request.session.user = null;
	response.render('pages/login');
	//$("body").append("<div>TEST</div>");
	//console.log($("h2").html());

});

app.get('/sales', function(req, res) {
	var username = req.session.user;
	if(!username) {
		res.render('pages/login');
	}

	connection.query("SELECT * FROM SteamGame.SteamStore WHERE Discount > 0 ORDER BY(Discount) DESC LIMIT 100", function(err, result) {
		var jsonData = '[';
		result.forEach(function(r) {
			//jsonData += '{"AppId": "' + r.AppId + '", "Username": "'+thing+'", "GameName": "'+ r.GameName + '", "ReleaseDate": "'+ r.ReleaseDate+'", "Discount": '+ r.Discount +', "OriginalPrice": '+ r.OriginalPrice+ ', "SalePrice": '+ r.SalePrice+', "PhotoURL": "'+ r.PhotoURL+'"' +'},';

			jsonData += '{"GameName": "'+ r.GameName.toString().replace(/["]/g, "")+ '", "OriginalPrice": '+ r.OriginalPrice + ', "SalePrice": ' + r.SalePrice + ' },';
		});
		jsonData = jsonData.slice(0,-1);
		jsonData += ']';

		res.render('pages/sales', {
			jsonData: jsonData,
			result: result,
			username: username
		});
	});
});

app.get('/recs', function(request, response) {
	var username = request.session.user;
	if(!username) {
		response.render('pages/login');
	}
	//username = 'evereveron';

	connection.query("SELECT tags, count(tags) as TagsTotal FROM SteamGame.wishlisttags WHERE Username = '"+ username +"' Group by tags order by(TagsTotal) desc",function(err, result){
		var tagsData = "[";
		var count=0; //for pie chart
		var colorCount = 0;
		var colors = ["#2484c1", "#0c6197", "#4daa4b", "#90c469", "#90c469", "#e4a14b", "#e98125", "#cb2121", "#830909", "#923e99", "#ae83d5", "#bf273e", "#bf273e", "#bca44a", "#618d1b", "#1ee67b", "#b0ec44", "#a4a0c9", "#322849", "#86f71a", "#d1c87f", "#44b9b0"];
		
		//console.log(result);
		var topthree = ["", "",""];

		result.forEach(function(r) {
			if(r.Tags !== 'Early Access' && count <= 25){
				if(count < 3){
					topthree[count] = r.Tags;
				}
				count++;
				if(colorCount == colors.length) {
					colorCount = 0;
				}
				tagsData += '{"label": "' + r.Tags + '", "value": '+r.TagsTotal+', "color":"' + colors[colorCount] + '"},'
				colorCount++;
			}
		});

		tagsData = tagsData.slice(0, -1);
		tagsData += ']';

		//now for hours played....
		var hoursPlayed = '[';
		var count2=0; //for donut chart
		var colorCount2 =0;
		//colors2 for donut
		var colors2 = ["#43bf8b", "#009c43", "#0d6305", "#417647", "#0aa016", "#37b053", "#043d01", "#055d00", "#0a7c02"];

		connection.query("SELECT Hours, GameName FROM SteamGame.HoursPlayed WHERE UserName = '"+ username +"'",function(err, result2){
			//console.log(result2);

			result2.forEach(function(h) {
				if(count2 <25) {
					count2++;
					if(colorCount2 == colors2.length) {
						colorCount2 = 0;
					}
					hoursPlayed += '{"label": "' + h.GameName + '", "value": ' +h.Hours + ', "color":"' + colors2[colorCount2] + '"},'
					colorCount2++;
				}
			});

			hoursPlayed = hoursPlayed.slice(0, -1);
			hoursPlayed += ']';

			//console.log(hoursPlayed);

			//console.dir(topthree);
			var qs = "SELECT * FROM SteamGame.SteamStore as ss JOIN SteamGame.tagsData t1 ON ss.AppId = t1.AppID JOIN SteamGame.tagsData t2 ON ss.AppId = t2.AppID JOIN SteamGame.tagsData t3 ON ss.AppId = t3.AppID ";
			qs = qs + "WHERE  t1.Tags = '" + topthree[0] + "' AND t2.Tags = '" + topthree[1] + "' AND t3.Tags = '" +topthree[2] + "' ";
			qs = qs + "LIMIT 10";
			//"CALL SteamGame.multiTags('" + topthree[0] + "','"+ topthree[1] +"','"+ topthree[2]+"')"
			connection.query(qs, function(err2, recommends){
				console.log(recommends);
				console.log(qs);
				response.render('pages/recs', {
					r: recommends,
					tagsData: tagsData,
					username: username,
					count: count,
					hoursPlayed: hoursPlayed,
					count2: count2
				});
			});
		});
				/*
		connection.query("SELECT Hours, GameName FROM SteamGame.HoursPlayed WHERE UserName = '"+ username +"'",function(err, result2){
			console.log(result2);

			result2.forEach(function(h) {
				if(count2 <25) {
					count++;
					if(colorCount2 == colors2.length) {
						colorCount2 = 0;
					}
					hoursPlayed += '{"label": "' + h.GameName + '", "value": ' +h.Hours + ', "color":' + colors2[colorCount2] + '"},'
					colorCount2++;
				}
			});

			hoursPlayed = hoursPlayed.slice(0, -1);
			hoursPlayed += ']';

			console.log("render...");
			response.render('pages/recs', {
				tagsData: tagsData,
				username: username,
				count: count,
				hoursPlayed: hoursPlayed,
				count2: count2
			});

		}); */

	
	});

});

app.post('/', function(request, response) {
	console.log('redirect');
	response.redirect('pages/index');
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

/*gets the user wishlist url and parses the user's wishlist for the game's appID*/
app.get('/index', function (request, response) {
	var thing = request.session.user;
	if(!thing) {
		response.render('pages/login');
		//request.session.user = 'help';
	}
	var qs = "SELECT tsd.* FROM SteamGame.topsellersdata tsd where tsd.AppId not in (SELECT tsd.AppId FROM SteamGame.topsellersdata tsd join SteamGame.wishlistdata wish on tsd.AppId = wish.AppId where wish.Username = '" + thing + "') order by tsd.Rank Limit 50"
	connection.query(qs,function(err, result){
		var jsonData = '[';
		result.forEach(function(r) {
			//jsonData += '{"AppId": "' + r.AppId + '", "Username": "'+thing+'", "GameName": "'+ r.GameName + '", "ReleaseDate": "'+ r.ReleaseDate+'", "Discount": '+ r.Discount +', "OriginalPrice": '+ r.OriginalPrice+ ', "SalePrice": '+ r.SalePrice+', "PhotoURL": "'+ r.PhotoURL+'"' +'},';
			jsonData += '{"GameName": "'+ r.GameName + '", "OriginalPrice": '+ r.OriginalPrice + ', "SalePrice": ' + r.SalePrice + ' },';
		});
		jsonData = jsonData.slice(0,-1);
		jsonData += ']';

		response.render('pages/index', {
			result: result,
			jsonData: jsonData,
			username: thing
		});
	});

}); /*end of app.get '/' */

/****************** API STUFF ********************/

var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

//routes for /:username
//access at GET https://steam-wish.herokuapp.com/api/:username
router.route('/:username')
	.get(function (req, res) {
		req.session.user = req.params.username;
		res.json({message: 'hello ' + req.params.username});
		//global.username = req.params.username;
		parseWishes(req.params.username);
		//res.render('/pages/index');
		
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

/*************** END OF API STUFF *****************/


app.get('/search', function (request, response) {

	var username = request.session.user;
	if(!username) {
		//redirect back to login page if no user exists
		response.render('pages/login');
	}
	var queryStr = 'SELECT * FROM SteamGame.wishlistdata where Username = "' + username + '" ';
/*
	var sortby = request.query.sort;

	if(sortby != undefined) {
		var sort = 'ASC';
		var order = sortby.split('-||,');
		if(sortby.indexOf('-') > -1){
			sort = 'DESC'
		}
		var querySort = 'SELECT * FROM SteamGame.wishlistdata where Username = "' + username + '" ORDER BY ' + order + ' ' + sort;
		console.log(querySort);
		connection.query(querySort, function (err, result) {
			if (err) throw err;
			response.locals.currOrder = order;
			response.locals.currSort = sort;
			response.render('pages/search', {result: result});
		});
	}
	*/
	connection.query(queryStr,function(err, result){
		response.render('pages/search', {result: result, username: username});


	});
}); /*end of app.get '/' */

app.post('/search', function(request, response){

	var username = request.session.user;

	if(!username) {
		response.render('pages/login');
	}
	var querySearch = "";

	var gameSearch = request.body.gameSearch;
	var tagSearch = request.body.tagSearch;
	var discountSearch = request.body.discountSearch;

	gameSearch.replace(/[^\w\s]/gi, '');
	tagSearch.replace(/[^\w\s]/gi, '');
	if(tagSearch == "") {
		querySearch = "SELECT * FROM SteamGame.wishlistdata where Username = '" + username + "' ";
	}else if(tagSearch.length > 0){
		querySearch = "SELECT * FROM SteamGame.wishlistdata as wishdata inner join SteamGame.tagsData as tags on wishdata.AppId = tags.AppID where wishdata.Username = '" + username + "' ";
	}
	if(gameSearch.length > 0 && discountSearch == 0 && tagSearch == "") { //search game
		querySearch = querySearch + "AND GameName LIKE '%" + gameSearch + "%'";
	}else if(gameSearch == "" && discountSearch > 0 && tagSearch == ""){ //search discount
		querySearch = querySearch + "AND Discount >= " + discountSearch;
	}else if(gameSearch != '' && discountSearch > 0 && tagSearch == ""){ //search game and discount
		querySearch = querySearch + "AND Discount >= " + discountSearch + " AND GameName LIKE '%" + gameSearch + "%'";
	}else if(gameSearch == "" && discountSearch == 0 && tagSearch != ""){ //search tag
		querySearch = querySearch + "AND tags.Tags like '%" + tagSearch + "%'"
	}else if(gameSearch == "" && discountSearch > 0 && tagSearch != ""){ //search discount and tag
		querySearch = querySearch + "AND tags.Tags like '%" + tagSearch + "%' AND wishdata.Discount >= " + discountSearch;
	}else if(gameSearch != "" && discountSearch == 0 && tagSearch != ""){ //search game and tag
		querySearch = querySearch + "AND tags.Tags LIKE '%" + tagSearch + "%' AND wishdata.GameName like '%" + gameSearch + "%'";
	}else if(gameSearch != "" && discountSearch > 0 && tagSearch != ""){ //search discount, game and tag
		querySearch = querySearch + "AND tags.Tags LIKE '%" + tagSearch + "%' AND wishdata.GameName like '%" + gameSearch + "%' AND wishdata.Discount >= " + discountSearch;
	}

/*
	var sortby = request.query.sort;
	if(sortby != undefined) {
		var sort = 'ASC';
		var order = sortby.split('-||,');
		if (sortby.indexOf('-') > -1) {
			sort = 'DESC'
		}
		response.locals.currOrder = order;
		response.locals.currSort = sort;
		querySearch = querySearch + ' ORDER BY ' + order + ' ' + sort;

	}
	*/
	console.log(querySearch);
	connection.query(querySearch ,function(err, result){
		if(err) throw err;
		
		response.render('pages/search', {result: result, username: username});
	});
});


var url;
app.post('/', function (request, response) {
	global.url = request.body.urlName || "http://steamcommunity.com/id/T1War/wishlist/";
});

/*
 app.get('/index/:page', function (request, response) {

 });
 */
parseWishes = function(username) {
	var insertQ;
	request("http://steamcommunity.com/id/" + username + "/wishlist/", function(err, resp, body){
		//console.log(appidList);
		var appid;
		//var appidList = [];

		insertQ = 'INSERT IGNORE INTO SteamGame.userWishlistTemp VALUES ' || console.log(err);

		if(!err && resp.statusCode == 200){
			var $ = cheerio.load(body);
			/*
            if($('.error-ctn')) {
                //console.log("error!!!!! user profile does not exist!!");
                return;
            }*/
            if(body.indexOf("Error") != -1 || body.indexOf("This profile is private." != -1)){
            	console.log("user profile does not exist!");
            	return;
            }
            console.log("profile exists :)");

			$('div.wishlistRow').each(function(){
				appid = $(this).attr('id');
				appid = appid.replace("game_", "");
				insertQ = insertQ + '(' + appid + ', "' + username + '"),';

			}); /*end of each function*/
			insertQ = insertQ.slice(0,-1);
			console.log(insertQ);
			//console.log(global.insertQ);

			connection.query(insertQ ,function(err, result){
				if(err) throw err;
				//console.log('result:', result);
			});

		} else {
			//this does nothing lol
			console.log('error in parsewishes. user profile doesnt exist?');
		}


	});

};





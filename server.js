var express = require('express');
var faker = require('faker');
var bodyParser = require ('body-parser');
var jwt = require('jsonwebtoken');
var cors = require ('cors')
var expressJwt = require('express-jwt');

var jwtSecret = 'abcdefg';

var app = express();

app.use(cors());
app.use (bodyParser.json());


app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));


var user = {

	username: "x",
	password: "x"
}

//Utile per l'autorizzazione....
app.use(function(req,res,next){

	console.log('eccolo....');
	console.log(req.originalUrl);
	console.log(req.user);
	next();
})



app.get ('/randomUser', function (req, res){

	var user = faker.helpers.userCard();
	user.avatar = faker.image.avatar();
	//console.log(req.user)
	res.json (user);

})

app.post ('/login', authenticate,function (req, res){

	var token = jwt.sign({
		usernamexxx: user.username
	},jwtSecret) 
	res.send ({
		token : token
	});	

})

app.get ('/me', function (req, res){

	console.log('prima me....');
	//console.log(req.route);
	console.log('dopo me....');
	res.send (user);

})


function authenticate(req,res,next){

	var body = req.body;
	if (!body.username || ! body.password){
		res.status (400).end ('Must provide username and passowrd....');
		return;
	}

	if (body.username != user.username || body.password != user.password){
		console.log (body.username + "-" + body.password);
		res.status (401).end ('Username or password incoorect....');
		return;
	}
	console.log('auth ok!!!!');
	next();

}

app.listen ('3000', function (){

	console.log('listening on port 3000....');
}) 
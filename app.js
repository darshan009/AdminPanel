var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path    = require("path");

var app = express();

//mongoose connection
mongoose.connect("mongodb://test:test123@ds059165.mongolab.com:59165/interviewer");
mongoose.connection.on('error', function(){
  console.log("Mongoose connection error");
});

//views, bodyparser, cookieParser, session
// app.set("views",__dirname+"/views");
// app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(__dirname+'/'));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "2hjkeydwjfhusdifsb",
  store: new MongoStore({
    url: "mongodb://test:test123@ds059165.mongolab.com:59165/interviewer",
    autoReconnect: true
  })
}));
app.use(function(req, res, next){
  res.locals.currentUser= req.user;
  next();
});


//routes
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/views/userList.html'));
});
app.get('/addUser.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/addUser.html'));
});
app.get('/itemList.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/itemList.html'));
});
app.get('/addItem.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/addItem.html'));
});
app.get('/categoryList.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/categoryList.html'));
});
app.get('/addCategory.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/addCategory.html'));
});
app.get('/menuList.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/menuList.html'));
});
app.get('/addMenu.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/addMenu.html'));
});
app.get('/orderList.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/orderList.html'));
});
app.get('/addOrder.html', function(req, res){
    res.sendFile(path.join(__dirname+'/views/addOrder.html'));
});


//listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function(){
  console.log("Server connected");
});

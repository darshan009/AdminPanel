var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();

//mongoose connection
mongoose.connect("mongodb://localhost:27017/adminpanel");
mongoose.connection.on('error', function(){
  console.log("Mongoose connection error");
});

//views, bodyparser, cookieParser, session
app.set("views",__dirname+"/views");
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(__dirname+'/'));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "2hjkeydwjfhusdifsb",
  store: new MongoStore({
    url: "mongodb://localhost:27017/adminpanel",
    autoReconnect: true
  })
}));
app.use(function(req, res, next){
  res.locals.currentUser= req.user;
  next();
});

//controllers
var userController = require('./controllers/user');

//routes
app.get('/', function(req, res){
    res.render('adminLogin');
});
app.get('/userList', userController.getUsers);
app.post('/addUser', userController.postAddUser);
app.post('/addUser/:id', userController.postAddUser);
app.get('/addUser', userController.getAddUser);
app.get('/addUser/:id', userController.getAddUser);
app.get('/itemList', function(req, res){
    res.render('itemList');
});
app.get('/addItem', function(req, res){
    res.render('addItem');
});
app.get('/categoryList', function(req, res){
    res.render('categoryList');
});
app.get('/addCategory', function(req, res){
    res.render('addCategory');
});
app.get('/menuList', function(req, res){
    res.render('menuList');
});
app.get('/addMenu', function(req, res){
    res.render('addMenu');
});
app.get('/orderList', function(req, res){
    res.render('orderList');
});
app.get('/addOrder', function(req, res){
    res.render('addOrder');
});


//listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function(){
  console.log("Server connected");
});

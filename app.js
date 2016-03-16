var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var passportConf = require('./config/passport');
var secrets = require('./config/secrets');

var app = express();

//mongoose connection
mongoose.connect(secrets.mongodburl);
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
    url: secrets.mongodburl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  res.locals.currentUser= req.user;
  next();
});

//controllers
var userController = require('./controllers/user');
var itemController = require('./controllers/item');

//routes
app.get('/', userController.getLogin);
app.post('/', userController.postLogin);
//user OR Admin
app.get('/userList', userController.isAdmin, userController.getUsers);
app.post('/addUser', userController.isAdmin, userController.postAddUser);
app.post('/addUser/:id', userController.isAdmin, userController.postAddUser);
app.get('/addUser', userController.isAdmin, userController.getAddUser);
app.get('/addUser/:id', userController.isAdmin, userController.getAddUser);
app.get('/logout', userController.getLogout);
app.get('/itemList', function(req, res){
    res.render('itemList');
});
app.get('/addItem', function(req, res){
    res.render('addItem');
});
//item category
app.get('/categoryList', userController.isAdmin, itemController.getItemCategories);
app.get('/addCategory', userController.isAdmin, itemController.getAddItemCategory);
app.post('/addCategory', userController.isAdmin, itemController.postAddItemCategory);
app.get('/addCategory/:id', userController.isAdmin, itemController.getAddItemCategory);
app.post('/addCategory/:id', userController.isAdmin, itemController.postAddItemCategory);
app.get('/addCategory/delete/:id', userController.isAdmin, itemController.deleteItemCategory);

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

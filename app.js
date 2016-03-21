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
mongoose.connect(secrets.mongodburl, function(){
  console.log("Mongoose connected to mongolab");
});
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
var menuController = require('./controllers/menu');
var orderController = require('./controllers/order');

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
//item category
app.get('/categoryList', userController.isAdmin, itemController.getItemCategories);
app.get('/addCategory', userController.isAdmin, itemController.getAddItemCategory);
app.post('/addCategory', userController.isAdmin, itemController.postAddItemCategory);
app.get('/addCategory/:id', userController.isAdmin, itemController.getAddItemCategory);
app.post('/addCategory/:id', userController.isAdmin, itemController.postAddItemCategory);
app.get('/addCategory/delete/:id', userController.isAdmin, itemController.deleteItemCategory);
//items
app.get('/itemList', userController.isAdmin, itemController.getItemList);
app.get('/addItem', userController.isAdmin, itemController.getAddItem);
app.get('/addItem/:id', userController.isAdmin, itemController.getAddItem);
app.post('/addItem', userController.isAdmin, itemController.postAddItem);
app.post('/addItem/:id', userController.isAdmin, itemController.postAddItem);
//menu
app.get('/menuList', userController.isAdmin, menuController.getMenuList);
app.get('/addMenu', userController.isAdmin, menuController.getAddMenu);
app.get('/addMenu/:id', userController.isAdmin, menuController.getAddMenu);
app.post('/addMenu', userController.isAdmin, menuController.postAddMenu);
app.post('/addMenu/:id', userController.isAdmin, menuController.postAddMenu);
//ajax populate
app.get('/getItemsFromCategory', menuController.getItemsFromCategory);
app.get('/addMenu/delete/:id', userController.isAdmin, menuController.deleteMenu);
//order
app.get('/orderList', userController.isAdmin, orderController.getOrderList);
app.get('/addOrder', userController.isAdmin, orderController.getAddOrder);
app.get('/addOrder/:id', userController.isAdmin, orderController.getEditOrder);
app.post('/addOrder', userController.isAdmin, orderController.postAddOrder);
app.post('/addOrder/:id', userController.isAdmin, orderController.postAddOrder);
app.get('/addOrder/delete/:id', userController.isAdmin, orderController.deleteOrder);
//populate menu in add order
app.get('/getMenusFromOptions', orderController.getMenusFromOptions);
app.get('/getUserAddress', orderController.getUserAddress);

//listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function(){
  console.log("Server connected");
});

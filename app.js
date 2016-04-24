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
mongoose.connection.on('error', console.error.bind(console, 'connection error'));
mongoose.connection.once('open', function callback(){
  console.log("Mongoose connected to mongolab");
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
var assemblyController = require('./controllers/assembly');
var tiffinController = require('./controllers/tiffin');

//routes
app.get('/', userController.getLogin);
app.post('/', userController.postLogin);
//user OR Admin
app.get('/userList', userController.isAdmin, userController.getUsers);
app.post('/addUser', userController.isAdmin, userController.postAddUser);
app.post('/editUser/:id', userController.isAdmin, userController.postAddUser);
app.get('/addUser', userController.isAdmin, userController.getAddUser);
app.get('/editUser/:id', userController.isAdmin, userController.getAddUser);
app.get('/orderHistory', userController.isAdmin, userController.getUsersForHistory);
app.get('/orderHistory/:email', userController.isAdmin, userController.getUserHistory);
app.get('/logout', userController.getLogout);
//item category
app.get('/categoryList', userController.isAdmin, itemController.getItemCategories);
app.get('/addCategory', userController.isAdmin, itemController.getAddItemCategory);
app.post('/addCategory', userController.isAdmin, itemController.postAddItemCategory);
app.get('/editCategory/:id', userController.isAdmin, itemController.getAddItemCategory);
app.post('/editCategory/:id', userController.isAdmin, itemController.postAddItemCategory);
app.get('/addCategory/delete/:id', userController.isAdmin, itemController.deleteItemCategory);
//items
app.get('/itemList', userController.isAdmin, itemController.getItemList);
app.get('/addItem', userController.isAdmin, itemController.getAddItem);
app.get('/editItem/:id', userController.isAdmin, itemController.getAddItem);
app.post('/addItem', userController.isAdmin, itemController.postAddItem);
app.post('/editItem/:id', userController.isAdmin, itemController.postAddItem);
//menu
app.get('/menuList', userController.isAdmin, menuController.getMenuList);
app.get('/addMenu', userController.isAdmin, menuController.getAddMenu);
app.get('/editMenu/:id', userController.isAdmin, menuController.getAddMenu);
app.post('/addMenu', userController.isAdmin, menuController.postAddMenu);
app.post('/editMenu/:id', userController.isAdmin, menuController.postAddMenu);
app.get('/getItemListForMenu', userController.isAdmin, menuController.getItemListForMenu);
app.get('/getItemCost', userController.isAdmin, menuController.getItemCost);
//ajax populate
app.get('/getItemsFromCategory', menuController.getItemsFromCategory);
app.get('/addMenu/delete/:id', userController.isAdmin, menuController.deleteMenu);
//order
app.get('/orderList', userController.isAdmin, orderController.getOrderList);
app.get('/addOrder', userController.isAdmin, orderController.getAddOrder);
app.get('/viewOrder/:id', userController.isAdmin, orderController.getViewOrder);
app.get('/editOrder/:id', userController.isAdmin, orderController.getEditOrder);
app.post('/addOrder', userController.isAdmin, orderController.postAddOrder);
app.post('/editOrder/:id', userController.isAdmin, orderController.postAddOrder);
app.get('/addOrder/delete/:id/:userEmail', userController.isAdmin, orderController.deleteOrder);
//datePickedOrderList
app.get('/getOrdersByDate', orderController.getOrdersByDate);
//new assembly
app.get('/nassembly', assemblyController.getnAssemblyList);
app.get('/getSingleOrders', assemblyController.getSingleOrders);
app.get('/singleOrdersWithExtras', assemblyController.getSingleOrdersWithExtrasPage);
app.get('/getSingleOrdersWithExtras', assemblyController.getSingleOrdersWithExtras);
app.get('/multipleCategoryOrders', assemblyController.getMultipleCategoryOrdersPage);
app.get('/getMultipleCategoryOrders', assemblyController.getMultipleCategoryOrders);
//assembly
app.get('/assembly', assemblyController.getAssemblyList);
app.get('/mixedAssembly', assemblyController.getMixedAssemblyList);
app.get('/multipleAssembly', assemblyController.getMultipleAssemblyList);
app.get('/getOrderByCategory', assemblyController.getOrderByCategory);
app.get('/getCustomizedOrderByCategory', assemblyController.getCustomizedOrderByCategory);
//tiffin service
app.get('/tiffinInNOut', userController.isAdmin, tiffinController.getTiffinInNOut);
app.get('/tiffinReport', userController.isAdmin, tiffinController.getTiffinReport);
//items list in assembly
app.get('/singleItems', assemblyController.getSingleItemsPage);
app.get('/singleItemsList', assemblyController.getSingleItems);
//populate menu in add order
app.get('/getMenusFromOptions', orderController.getMenusFromOptions);
app.get('/getUserAddress', orderController.getUserAddress);
app.get('/getCustomizedMenuToItem', orderController.getCustomizedMenuToItem);
//listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function(){
  console.log("Server connected");
});

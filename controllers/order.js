var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');

//controllers
exports.getOrderList = function(req, res) {
  Order.find()
  .populate('menu', 'item')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu.item', function(err, results){
      res.render('orderList', {results : results});
    })
  });
};

exports.getAddOrder = function(req, res){
  Order.findById(req.params.id).exec(function(err, order){
    ItemCategory.find().exec(function(err, itemCategories){
      User.find().exec(function(err, users){
        if(order) var orderMenu = order.menu
        Menu.findById(orderMenu).exec(function(err, menus){
          if(menus) var menuItem = menus.item
          Item.findById(menuItem).exec(function(err, item){
            res.render('addOrder', {
              order: order,
              itemCategories: itemCategories,
              users: users,
              menuName: item,
              menus: menus
            });
          })
        })
      })
    })
  });
};

exports.postAddOrder = function(req, res){
  if(req.params.id){
    Order.findById(req.params.id).exec(function(err, order){
      Menu.findById(req.body.menuSelected)
      .populate('item', 'totalCost')
      .exec(function(err, menu){
        User.findOne({email: req.body.user}).exec(function(err, user){
          order.date= req.body.date;
          order.meal= req.body.meal;
          order.category= req.body.category;
          order.menu= menu._id;
          order.user= req.body.user;
          order.address = req.body.address;
          var newAmount = Number(user.amount);
          user.amount = 0;
          newAmount -= Number(menu.item.totalCost);
          user.amount = newAmount;
          user.save(function (err) {
            if (err) return err;
          });
          var fullUserAddress = {};
          for (var i=0; i<user.address.length; i++)
            if (user.address[i].tag == req.body.address) {
              fullUserAddress = {
                tag : user.address[i].tag,
                flatNo : user.address[i].flatNo,
                streetAddress : user.address[i].streetAddress,
                landmark : user.address[i].landmark,
                pincode : user.address[i].pincode
              }
            }
          order.address = {};
          order.address = fullUserAddress;
          order.save(function (err) {
              if (err) return err
          })
          res.redirect('/orderList');
        });
      });
    });
  }
  else {
    Menu.findById(req.body.menuSelected)
    .populate('item', 'totalCost')
    .exec(function(err, menu){
      User.findOne({email: req.body.user}).exec(function(err, user){
        var order = new Order({
          date: req.body.date,
          meal: req.body.meal,
          category: req.body.category,
          menu: menu._id,
          user: req.body.user,
        })

        var newAmount = Number(user.amount);
        user.amount = 0;
        newAmount -= Number(menu.item.totalCost);
        user.amount = newAmount;
        user.save(function (err) {
          if (err) return err;
        })
        var fullUserAddress = {};
        for (var i=0; i<user.address.length; i++)
          if (user.address[i].tag == req.body.address) {
            fullUserAddress = {
              tag : user.address[i].tag,
              flatNo : user.address[i].flatNo,
              streetAddress : user.address[i].streetAddress,
              landmark : user.address[i].landmark,
              pincode : user.address[i].pincode
            }
          }
        order.address = {};
        order.address = fullUserAddress;
        order.save(function (err) {
          if (err) return err;
        });
        res.redirect('/orderList');
      });
    });
  }
};

exports.deleteOrder = function(req,res){
  Order.findById(req.params.id).exec(function(err, order){
    if(err) return err;
    console.log(order)
    order.remove();
    res.redirect('/orderList');
  });
};

//ajax populate getMenuList select box
exports.getMenusFromOptions = function(req, res){
  var menuOptions = {}
  if(req.query.category)
   menuOptions.category = req.query.category
  if(req.query.date)
    menuOptions.date = req.query.date
  if(req.query.meal)
    menuOptions.meal = req.query.meal
  Menu.find(menuOptions)
  .populate('item', 'title')
  .exec(function(err, menusList){
      var menusListJson = []
      console.log( menuOptions )
      console.log(menusList);
      for(var i=0; i<menusList.length; i++){
        menusListJson[i] = {
          id: menusList[i]._id,
          item: menusList[i].item.title
        }
      }
      res.send(menusListJson);
  });
};

//ajax get user addresses
exports.getUserAddress = function(req, res){
  if(req.query.userEmail) var userEmail = req.query.userEmail
  User.findOne({email: userEmail}).exec(function(err, user){
    var userAddressJson = [];
    for(var i=0; i<user.address.length; i++){
      userAddressJson[i] = {
        address : user.address[i].tag
      }
    }
    console.log(userAddressJson)
    res.send(userAddressJson);
  })
};

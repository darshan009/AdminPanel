var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');

//controllers
exports.getOrderList = function(req, res) {
  Order.find()
  .populate('menu._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, results){
      var fullResult = [];
      var z = 0;
      for (var i=0; i<results.length; i++){
        for (var j=0; j<results[i].menu.length; j++){
          fullResult[z] = {
              id : orders[i]._id,
              title : results[i].menu[j]._id.item.title,
              date : results[i].menu[j]._id.date,
              user : results[i].user
          }
          z++;
        }
      }
      //console.log(fullResult)
      res.render('orderList', {fullResult : fullResult});
    })
  });
};

exports.getAddOrder = function(req, res){
  ItemCategory.find().exec(function(err, itemCategories) {
    User.find().exec(function(err, users) {
      res.render('addOrder', {
        itemCategories: itemCategories,
        users: users
      });
    })
  });
};

exports.getEditOrder = function(req, res){
  Order.findById(req.params.id)
  .populate('menu._id')
  .exec(function(err, order) {
    Item.populate(order, 'menu._id.item', function(err, result) {
      if(!result) res.end("No order found")
      ItemCategory.find().exec(function(err, itemCategories) {
        User.find().exec(function(err, users) {
          User.findOne({email : order.user}).exec(function(err, userFound) {
            if (!order) res.end("Order not found")
            var fullResult = [];
            for (var i=0; i<result.menu.length; i++)
              fullResult[i] = {
                id : result.menu[i]._id._id,
                title : result.menu[i]._id.item.title
              }
            var addressTag = [];
            for (var i=0; i<userFound.address.length; i++)
              addressTag.push(userFound.address[i].tag);
            console.log(result);
            res.render('addOrder', {
              itemCategories: itemCategories,
              users: users,
              addressTag : addressTag,
              result : result,
              fullResult : fullResult //result.menu._id.
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
      var allMenus = [];
      for (var i=0; i<req.body.allMenus.length; i++){
        if(req.body.allMenus[i] != '')
          allMenus.push(req.body.allMenus[i]);
      }
      Menu.find({_id : {$in : allMenus}})
      .populate('item', 'totalCost')
      .exec(function(err, menus){
        User.findOne({email: req.body.user}).exec(function(err, user){
          order.user= req.body.user;
          order.address = req.body.address;
          // var totalCostToSub = 0;
          // var orderMenuFound = [];
          // for (var i=0; i<order.menu.length; i++) {
          //   for (var j=0; j<menus.length; j++){
          //     if ((menus[j]._id).toString() == (order.menu[i]._id).toString())
          //       orderMenuFound.push(order.menu[i]._id)
          //   }
          // }
          //
          // for (var i=0; i<order.menu.length; i++) {
          //
          // }
          //totalCostToSub += menus[j].item.totalCost;
          // var newAmount = Number(user.amount);
          // user.amount = 0;
          // newAmount -= totalCostToSub;
          // user.amount = newAmount;
          // user.save(function (err) {
          //   if (err) return err;
          // });
          order.menu = [];
          for (var i=0; i<allMenus.length; i++)
            order.menu.push({
              _id : allMenus[i]
            })
          var fullUserAddress = {};
          if (user.address)
            for (var i=0; i<user.address.length; i++)
              if (user.address[i].tag == req.body.address) {
                fullUserAddress = {
                  tag : user.address[i].tag,
                  flatNo : user.address[i].flatNo,
                  streetAddress : user.address[i].streetAddress,
                  landmark : user.address[i].landmark,
                  pincode : user.address[i].pincode,
                  contactNo : user.contactNo
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
    var allMenus = [];
    console.log(req.body.allMenus)
    for (var i=0; i<req.body.allMenus.length; i++){
      if(req.body.allMenus[i] != '')
        allMenus.push(req.body.allMenus[i]);
    }
    console.log(allMenus)
    Menu.find({_id : {$in : allMenus}})
    .populate('item', 'totalCost')
    .exec(function(err, menus){
      User.findOne({email: req.body.user}).exec(function(err, user){
        var order = new Order({
          user: req.body.user
        })
        console.log(menus)
        order.menu = [];
        for (var i=0; i<allMenus.length; i++)
          order.menu.push({
            _id : allMenus[i]
          })
        var fullUserAddress = {};
        if(user.address)
          for (var i=0; i<user.address.length; i++)
            if (user.address[i].tag == req.body.address) {
              fullUserAddress = {
                tag : user.address[i].tag,
                flatNo : user.address[i].flatNo,
                streetAddress : user.address[i].streetAddress,
                landmark : user.address[i].landmark,
                pincode : user.address[i].pincode,
                contactNo : user.contactNo
              }
            }
        order.address = {};
        order.address = fullUserAddress;
        order.save(function (err) {
          if (err) return err;
        });
        var totalCostToSub = 0;
        if (menus)
          for (var i=0; i<menus.length; i++) {
            totalCostToSub += menus[i].item.totalCost;
          }
        var newAmount = Number(user.amount);
        user.amount = 0;
        newAmount -= totalCostToSub;
        user.amount = newAmount;
        user.save(function (err) {
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
    if (user.address)
      for(var i=0; i<user.address.length; i++)
        userAddressJson[i] = {
          address : user.address[i].tag
        }
    console.log(userAddressJson)
    res.send(userAddressJson);
  })
};

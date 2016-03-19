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
        User.findOne({email: req.body.user}).exec(function(err, userAmount){
          order.date= req.body.date;
          order.meal= req.body.meal;
          order.category= req.body.category;
          order.menu= menu._id;
          order.user= req.body.user;
          var newAmount = Number(userAmount.amount);
          userAmount.amount = 0;
          newAmount -= Number(menu.item.totalCost);
          userAmount.amount = newAmount;
          userAmount.save(function (err) {
            if (err) return err;
          });
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
      User.findOne({email: req.body.user}).exec(function(err, userAmount){
        var order = new Order({
          date: req.body.date,
          meal: req.body.meal,
          category: req.body.category,
          menu: menu._id,
          user: req.body.user
        })
        var newAmount = Number(userAmount.amount);
        userAmount.amount = 0;
        newAmount -= Number(menu.item.totalCost);
        userAmount.amount = newAmount;
        userAmount.save(function (err) {
          if (err) return err;
        })
        order.save(function (err) {
          if (err) return err;
        });
        res.redirect('/orderList');
      });
    });
  }
};

exports.deleteOrder = function(req,res){
  order.findById(req.params.id).exec(function(err, order){
    if(err) return err;
    order.remove();
    res.redirect('/orderList');
  });
};

//ajax populate getMenuList select box
exports.getMenusFromOptions = function(req, res){
  Menu.find({
    category: req.query.category,
    meal: req.query.meal
  }).exec(function(err, menusList){
    var getMenusItem = [];
    if(menusList)
      for(var i=0; i<menusList.length; i++)
        getMenusItem.push(menusList[i].item);
    Item.find({_id: {$in: getMenusItem}}).exec(function(err, items){
      var menusListJson = []
      for(var i=0; i<menusList.length; i++){
        menusListJson[i] = {
          id: menusList[i]._id,
          item: items[i].title
        }
      }
      res.send(menusListJson);
    });
  })
};
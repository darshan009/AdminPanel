var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');

exports.getAssemblyList = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    if (err) return err;
    res.render('assembly', {itemCategories : itemCategories});
  });
};

exports.getOrderByCategory = function(req, res) {
  var queryCategory = req.query.category;
  var mealSelected = req.query.meal;
  var dateTime = new Date().toDateString();
  Order.find()
  .populate('menu._id', null, {
    category : queryCategory,
    meal : mealSelected,
    date : dateTime
  })
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      console.log(dateTime);
      var orderList = [], k =0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null) {
               console.log(results[i].menu[j]._id.meal);
               menuList.push(results[i].menu[j]);
             }
          }
          if (menuList.length > 0){
            orderList[k] = {
              user : results[i].user,
              address : results[i].address,
              menu : menuList
            }
            k++;
          }
        }
      }
      console.log(orderList);
      res.send(orderList);
    });
  });
};

exports.getCustomizedOrderByCategory = function(req, res){
  var queryCategory = req.query.category;
  var mealSelected = req.query.meal;
  var dateTime = new Date().toDateString();
  Order.find()
  .populate('menu._id', null, {
    category : queryCategory,
    meal : mealSelected,
    date : dateTime
   })
  .populate('menu.subItems._id')
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      var orderList = [], k =0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null && results[i].menu[j].subItems && results[i].menu[j].subItems._id != null) {
               console.log(results[i].menu[j]._id.category);
               menuList.push(results[i].menu[j]);
             }
          }
          if (menuList.length > 0){
            orderList[k] = {
              id : results[i]._id,
              user : results[i].user,
              address : results[i].address,
              menu : menuList
            }
            k++;
          }
        }
      }
      console.log(orderList);
      //console.log(orderList[0].menu);
      res.send(orderList);
    });
  });
};

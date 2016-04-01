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
  Order.find()
  .populate('menu._id', null, { category : queryCategory })
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      var orderList = [], k =0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null) {
               console.log(results[i].menu[j]._id.category);
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
  Order.find()
  .populate('menu._id', null, { category : queryCategory })
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      var orderList = [], k =0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null && results[i].menu[j].subItems.length > 0) {
               console.log(results[i].menu[j]._id.category);
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
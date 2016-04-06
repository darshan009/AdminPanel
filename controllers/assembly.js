var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');

exports.getAssemblyList = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return err;
      var customizableCategory = [];
      for (var i=0; i<items.length; i++)
        if (items[i].subItems.length > 0)
          customizableCategory.push({
            id : items[i].category._id,
            name : items[i].category.name
          });
      res.render('assembly', {
        itemCategories : itemCategories,
        customizableCategory : customizableCategory
      });
    })
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
  .populate('address._id')
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      console.log(dateTime);
      var orderList = [], k =0;
      var listOfUsers = [], menuLength = 0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          //get all users in orders
          if (listOfUsers.indexOf(results[i].user) < 0)
            listOfUsers.push(results[i].user);
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null) {
               console.log(results[i].menu[j]._id.meal);
               menuList.push(results[i].menu[j]);
             }
          }
          if (menuList.length > 0){
            menuLength += menuList.length;
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
      //---------order List by User----------
      console.log(listOfUsers);
      var orderListByUser = [];
      for (var l=0; l<listOfUsers.length; l++) {
        orderListByUser[l] = {
          user : listOfUsers[l],
          orderList : []
        };
        for (var m=0; m<orderList.length; m++)
          if (listOfUsers[l] == orderList[m].user)
            orderListByUser[l].orderList.push(orderList[m]);
        //get Menus length
        for (var n=0; n<orderListByUser[l].orderList.length; n++)
          menuLength += orderListByUser[l].orderList[n].menu.length;
        orderListByUser[l].menuLength = menuLength;
      }
      console.log(orderListByUser);
      res.send(orderListByUser);
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
  .populate('address._id')
  .populate('menu.subItems._id')
  .exec(function(err, orders){
    Item.populate(orders, 'menu._id.item', function(err, results) {
      var orderList = [], k =0;
      var listOfUsers = [], menuLength = 0;
      for (var i=0; i<results.length; i++) {
        var menuList = [];
        if (results[i].state == 'Published') {
          //get all users in orders
          if (listOfUsers.indexOf(results[i].user) < 0)
            listOfUsers.push(results[i].user);
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
      //---------order List by User----------
      console.log(listOfUsers);
      var orderListByUser = [];
      for (var l=0; l<listOfUsers.length; l++) {
        orderListByUser[l] = {
          user : listOfUsers[l],
          orderList : []
        };
        for (var m=0; m<orderList.length; m++)
          if (listOfUsers[l] == orderList[m].user)
            orderListByUser[l].orderList.push(orderList[m]);
        //get Menus length
        for (var n=0; n<orderListByUser[l].orderList.length; n++)
          menuLength += orderListByUser[l].orderList[n].menu.length;
        orderListByUser[l].menuLength = menuLength;
      }
      console.log(orderListByUser);
      res.send(orderListByUser);
    });
  });
};

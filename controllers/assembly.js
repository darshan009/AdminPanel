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
      if (err) return next(err);
      res.render('assembly', {
        itemCategories : itemCategories
      });
    })
  });
};

exports.getMixedAssemblyList = function(req, res, next) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return next(err);
      res.render('mixedAssembly', {
        itemCategories : itemCategories
      });
    })
  });
};

exports.getMultipleAssemblyList = function(req, res, next) {
  res.render('multipleAssembly');
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


// ---- Single items list --------
exports.getSingleItemsPage = function(req, res) {
  res.render('singleItems');
};

exports.getSingleItems = function(req, res) {
  var orderOptions = {}
  if(req.query.date)
    orderOptions.date = req.query.date;
  if(req.query.meal)
    orderOptions.meal = req.query.meal;
    console.log(orderOptions);
  Order.find()
  .populate('menu._id', null, orderOptions)
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, results){
      //console.log(results);
      if (err) return err;
      var singleItems = [], z = 0;
      for (var i=0; i<orders.length; i++) {
        for (var j=0; j<orders[i].menu.length; j++) {
          if (orders[i].menu[j].subItems._id) {
            for (var k=0; k<orders[i].menu[j].subItems._id.subItemsArray.length; k++) {
              singleItems[z] = {
                title: orders[i].menu[j].subItems._id.subItemsArray[k].name,
                quantity: orders[i].menu[j].singleQuantity * orders[i].menu[j].subItems._id.subItemsArray[k].quantity
              }
              z++;
            }
          }else if (orders[i].menu[j]._id && orders[i].menu[j]._id.subItems.length > 0) {
            for (var k=0; k<orders[i].menu[j]._id.subItems.length; k++) {
              singleItems[z] = {
                title: orders[i].menu[j]._id.subItems[k].name,
                quantity: orders[i].menu[j].singleQuantity * orders[i].menu[j]._id.subItems[k].quantity
              }
              z++;
            }
          }
          else {
            if (orders[i].menu[j]._id) {
              singleItems[z] = {
                title: orders[i].menu[j]._id.item.title,
                quantity: orders[i].menu[j].singleQuantity
              }
              z++
            }
          }
        }
      }
      console.log(singleItems);
      //sorting singleItems by name
      var uniqueItems = [], uniqueTitles = [], count = 0;
      for (var i=0; i<singleItems.length; i++)
        if (uniqueTitles.indexOf(singleItems[i].title) < 0)
          uniqueTitles.push(singleItems[i].title);

      for (var j=0; j<uniqueTitles.length; j++) {
        var quantityCount = 0;
        for (var k=0; k<singleItems.length; k++) {
          if (singleItems[k].title == uniqueTitles[j]) {
            quantityCount += singleItems[k].quantity;
            uniqueItems[count] = {
              title: singleItems[k].title,
              quantity: quantityCount
            }
          }
        }
        count++;
      }
      console.log(uniqueItems);
      res.send(uniqueItems)
    });
  });
};


/* ------------------------------
------- new assembly seciton ----
---------------------------- */
exports.getnAssemblyList = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return next(err);
      res.render('./newAssembly/singleOrders', {
        itemCategories : itemCategories
      });
    })
  });
};

exports.getSingleOrders = function(req, res) {
  var category = req.query.category;
  if (category.indexOf("-") > -1) {
    var newCategory = category.replace("-", " ");
    category = newCategory;
  }
  var orderOptions = {
    category : category,
    meal : req.query.meal,
    date : req.query.date
  };
  var mealType = req.query.mealType;
  Order.find()
  .populate('menu._id', null, orderOptions)
  .populate('address._id')
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, results) {
      if (results && results.state != 'Archieved') {
        var listOfOrdersByAddress = [], k = 0, testArray = [];
        for (var i=0; i<results.length; i++) {
          //single orders by users
          var orderList = [];
          for (var j = 0; j < results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null) {
              orderList.push(results[i].menu[j]);
            }
          }
          if (orderList.length == 1 && orderList[0]._id.item.type == mealType) {
            listOfOrdersByAddress[k] = {
              user: results[i].user,
              orderList: results[i].menu,
              address : results[i].address
            }
            k++;
          }
        }
        console.log(listOfOrdersByAddress);
        res.send(listOfOrdersByAddress);
      }
    });
  });
};

exports.getSingleOrdersWithExtrasPage = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return next(err);
      res.render('./newAssembly/mixedOrders', {
        itemCategories : itemCategories
      });
    })
  });
};
exports.getSingleOrdersWithExtras = function(req, res) {
  var orderOptions = {
    meal : req.query.meal,
    date : req.query.date
  };
  Order.find()
  .populate('menu._id', null, orderOptions)
  .populate('address._id')
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, resultsForCategory) {
      ItemCategory.populate(resultsForCategory, 'menu._id.item.category', function(err, results) {
        if (results && results.state != 'Archieved') {
          var listOfOrdersByAddresses = [], listOfOrdersByAddress = [], k = 0, testArray = [];
          for (var i=0; i<results.length; i++) {
            //single orders by users
            if (results[i].menu.length > 1) {
              var extrasCount = 1;
              for (var j = 0; j < results[i].menu.length; j++) {
                //check for extra values
                if (results[i].menu[j]._id != null && results[i].menu[j]._id.item.category.name == 'Extras') {
                  extrasCount++;
                  if (extrasCount == results[i].menu.length)
                    var extrasFound = true;
                }
              }
              if (extrasFound) {
                var orderList = [];
                for (var j = 0; j < results[i].menu.length; j++) {
                  if (results[i].menu[j]._id != null) {
                    orderList.push(results[i].menu[j]);
                  }
                }
                listOfOrdersByAddresses[k] = {
                  user: results[i].user,
                  address : results[i].address,
                  orderList: orderList
                }
                k++;
                extrasFound = false;
              }
            }
          }
          console.log(listOfOrdersByAddresses);
          res.send(listOfOrdersByAddresses);
        }
      });
    });
  });
};

exports.getMultipleCategoryOrdersPage = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return next(err);
      res.render('./newAssembly/multipleOrders', {
        itemCategories : itemCategories
      });
    })
  });
};
exports.getMultipleCategoryOrders = function(req, res) {
  var orderOptions = {
    meal : req.query.meal,
    date : req.query.date
  };
  Order.find()
  .populate('menu._id', null, orderOptions)
  .populate('address._id')
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, resultsForCategory) {
      ItemCategory.populate(resultsForCategory, 'menu._id.item.category', function(err, results) {
        if (results && results.state != 'Archieved') {
          var listOfOrdersByAddresses = [], listOfOrdersByAddress = [], k = 0, testArray = [];
          for (var i=0; i<results.length; i++) {
            //single orders by users
            if (results[i].menu.length > 1) {
              var extrasCount = 1, extrasFound = false;
              for (var j = 0; j < results[i].menu.length; j++) {
                //check for extra values
                if (results[i].menu[j]._id != null && results[i].menu[j]._id.item.category.name == 'Extras') {
                  extrasCount++;
                  if (extrasCount == results[i].menu.length)
                    var extrasFound = true;
                }
              }
              if (!extrasFound) {
                var orderList = [];
                for (var j = 0; j < results[i].menu.length; j++) {
                  if (results[i].menu[j]._id != null) {
                    orderList.push(results[i].menu[j]);
                  }
                }
                if (orderList.length > 1) {
                  listOfOrdersByAddresses[k] = {
                    user: results[i].user,
                    address : results[i].address,
                    orderList: orderList
                  }
                  k++;
                }
                extrasFound = false;
              }
            }
          }
          console.log(listOfOrdersByAddresses);
          res.send(listOfOrdersByAddresses);
        }
      });
    });
  });
};

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

exports.getMultipleAssemblyList = function(req, res) {
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

/*
 |-----------------------------------------------------------
 | Total of individual items for Item list page
 |-----------------------------------------------------------
 */
exports.getSingleItemsPage = function(req, res) {
  res.render('singleItems');
};

exports.getSingleItems = function(req, res) {
  var orderOptions = {}
  if(req.query.date)
    orderOptions.date = req.query.date;
  if(req.query.meal)
    orderOptions.meal = req.query.meal;
  Order.find(orderOptions)
  .populate('menu._id')
  .exec(function(err, orders) {
    console.log(orders.length);
      if (err)
        return err;
      var singleItems = [], z = 0, steel, disposable;
      if (!orders)
        res.send("No orders found");
      for (var i=0; i<orders.length; i++) {
        if (orders[i].state != 'Archieved')
          for (var j=0; j<orders[i].menu.length; j++) {
            if (orders[i].menu[j]._id) {
              steel = 0, disposable = 0;
              //steel and disposable containers for each item
              if (orders[i].menu[j].containerType == 'Steel')
                steel = orders[i].menu[j]._id.container;
              else if (orders[i].menu[j].containerType == 'Disposable')
                disposable = orders[i].menu[j]._id.container;
              if (steel > 0 || disposable > 0)
                singleItems[z] = {
                  title: orders[i].menu[j]._id.title,
                  quantity: orders[i].menu[j].singleQuantity,
                  steel: steel,
                  disposable: disposable
                }
              else
                singleItems[z] = {
                  title: orders[i].menu[j]._id.title,
                  quantity: orders[i].menu[j].singleQuantity
                }
              z++
            }
          }
      }

      // get the total number of each item
      var uniqueItems = [], uniqueTitles = [], count = 0;
      for (var i=0; i<singleItems.length; i++)
        if (uniqueTitles.indexOf(singleItems[i].title) < 0)
          uniqueTitles.push(singleItems[i].title);

      for (var j=0; j<uniqueTitles.length; j++) {
        var quantityCount = 0, steel = 0, disposable = 0;
        for (var k=0; k<singleItems.length; k++) {
          // calculating total steel and disposable containers for each item
          if (singleItems[k].title == uniqueTitles[j]) {
            quantityCount += singleItems[k].quantity;
            steel += singleItems[k].steel;
            disposable += singleItems[k].disposable;
            uniqueItems[count] = {
              title: singleItems[k].title,
              quantity: quantityCount,
              steel: steel,
              disposable: disposable
            }
          }
        }
        count++;
      }
      //console.log(uniqueItems);
      res.send(uniqueItems)
  });
};


/*
 |------------------------------
 | New assembly seciton
 |------------------------------
*/
exports.getnAssemblyList = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    if (err) {
      return err;
    }
    res.render('./newAssembly/singleOrders', {
      itemCategories : itemCategories
    });
  });
};

exports.getSingleOrders = function(req, res) {
  var category = req.query.category, mealType = req.query.mealType;

  Order.find({
    meal : req.query.meal,
    date : req.query.date
  })
  .populate('menu._id', null, {category : {$in: category}})
  .populate('address._id')
  .exec(function(err, orders) {
    //User.populate(resultsuser, 'address._id.user', function(err, results) {
      if (orders) {
        var listOfOrdersByAddress = [], k = 0, testArray = [], orderList;
        for (var i=0; i<orders.length; i++) {
          if (orders[i].state != 'Archieved' && orders[i].status != 'out') {
              //single orders by users
            if (orders[i].menu.length == 1) {
              orderList = [];
              for (var j = 0; j < orders[i].menu.length; j++) {
                if (orders[i].menu[j]._id != null) {
                  orderList.push(orders[i].menu[j]);
                }
              }
              if (orderList.length > 0 && orderList[0]._id.type == mealType) {
                listOfOrdersByAddress[k] = {
                  _id: orders[i]._id,
                  user: orders[i].user,
                  orderList: orders[i].menu,
                  address : orders[i].address
                }
                k++;
              }
            }
          }
        }
        console.log(listOfOrdersByAddress);
        res.send(listOfOrdersByAddress);
      }
    //});
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
  Order.find({
    meal : req.query.meal,
    date : req.query.date
  })
  .populate('menu._id')
  .populate('address._id')
  .exec(function(err, orders) {
    ItemCategory.populate(orders, 'menu._id.category', function(err, orders) {
      if (err) {
        return err;
      }
      if (orders) {
        var listOfOrdersByAddresses = [], listOfOrdersByAddress = [], k = 0, testArray = [];
        for (var i=0; i<orders.length; i++) {
          if(orders[i].state != 'Archieved') {
            //single orders by users
            if (orders[i].menu.length > 1) {
              var extrasCount = 1;
              for (var j = 0; j < orders[i].menu.length; j++) {
                //check for single orders with extra
                if (orders[i].menu[j]._id != null && orders[i].menu[j]._id.category.name == 'Extras') {
                  extrasCount++;
                  if (extrasCount == orders[i].menu.length)
                    var extrasFound = true;
                }
              }
              if (extrasFound) {
                var orderList = [];
                for (var j = 0; j < orders[i].menu.length; j++) {
                  if (orders[i].menu[j]._id != null) {
                    orderList.push(orders[i].menu[j]);
                  }
                }
                listOfOrdersByAddresses[k] = {
                  _id: orders[i]._id,
                  user: orders[i].user,
                  address : orders[i].address,
                  orderList: orderList
                }
                k++;
                extrasFound = false;
              }
            }
          }
        }
        console.log(listOfOrdersByAddresses);
        res.send(listOfOrdersByAddresses);
      }
    });
  });
};

exports.getMultipleCategoryOrdersPage = function(req, res) {
  ItemCategory.find().exec(function(err, itemCategories) {
    Item.find()
    .populate('category')
    .exec(function(err, items) {
      if (err) return (err);
      res.render('./newAssembly/multipleOrders', {
        itemCategories : itemCategories
      });
    })
  });
};

exports.getMultipleCategoryOrders = function(req, res) {
  Order.find({
    meal : req.query.meal,
    date : req.query.date
  })
  .populate('menu._id')
  .populate('address._id')
  .exec(function(err, results) {
    ItemCategory.populate(results, 'menu._id.category', function(err, orders) {
      if (orders) {
        var listOfOrdersByAddresses = [], listOfOrdersByAddress = [], k = 0, testArray = [], extrasCount, extrasFound, orderList;
        for (var i=0; i<orders.length; i++) {
          if (orders[i].state != 'Archieved' && orders[i].status != 'out') {
            //multiple orders only
            if (orders[i].menu.length > 1) {
              extrasCount = 1, extrasFound = false;
              for (var j = 0; j < orders[i].menu.length; j++) {
                //check for single orders with extra
                if (orders[i].menu[j]._id != null && orders[i].menu[j]._id.category.name == 'Extras') {
                  extrasCount++;
                  if (extrasCount == orders[i].menu.length)
                    extrasFound = true;
                }
              }
              if (!extrasFound) {
                orderList = [];
                for (var j = 0; j < orders[i].menu.length; j++) {
                  if (orders[i].menu[j]._id != null) {
                    orderList.push(orders[i].menu[j]);
                  }
                }
                if (orderList.length > 1) {
                  listOfOrdersByAddresses[k] = {
                    _id: orders[i]._id,
                    user: orders[i].user,
                    address : orders[i].address,
                    orderList: orderList
                  }
                  k++;
                }
                extrasFound = false;
              }
            }
          }
        }
        console.log("--------multipleCategoryOrders--------");
        console.log(listOfOrdersByAddresses);
        res.send(listOfOrdersByAddresses);
      }
    });
  });
};


/*
 |----------------------------------
 | AJAX call to chagne order status
 |----------------------------------
*/
exports.changeOrderStatus = function(req, res){
  console.log(req.query.orders);
  var queryOrders = req.query.orders;

  Order.find( { _id: {$in: queryOrders} } )
  .exec(function(err, orders){
    if (err) {
      return err;
    }
    if(!orders)
      res.end("No orders found");
    for(var i=0; i<orders.length; i++) {
      orders[i].status = 'out';
      orders[i].save(function(err){
        if(err)
          return err;
      });
    }
    console.log(orders);
    res.send(orders);
  });
};

/*
 |-----------------------------------------------------------
 | AJAX call to get orders by date for remainingOrders
 |-----------------------------------------------------------
*/
exports.getRemainingOrdersPage = function(req, res) {
  res.render('./newAssembly/remainingOrders');
};

exports.getRemainingOrdersByDate = function(req, res) {
  Order.find({
    date : req.query.date,
    meal: req.query.meal
  })
  .populate('menu._id')
  .populate('address._id')
  .exec(function(err, orders) {
    if (err) {
      return err;
    }
    var k = 0, orderList = [], menuList = [];
    for (var i=0; i<orders.length; i++){
      menuList = [];
      if (orders[i].state == 'Published' && orders[i].status != 'out') {
        for (var j=0; j<orders[i].menu.length; j++) {
          if (orders[i].menu[j]._id != null) {
            menuList.push(orders[i].menu[j]);
          }
        }
        if (menuList.length > 0) {
          orderList[k] = {
            id : orders[i]._id,
            date : orders[i].date.toDateString(),
            user : orders[i].user,
            address : orders[i].address,
            menu : menuList
          }
          k++;
        }
      }
    }
    console.log(orderList);
    res.send(orderList);
  });
};

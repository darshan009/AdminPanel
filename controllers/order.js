var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');
var SubItems = require('../models/SubItems');

//controllers
exports.getOrderList = function(req, res) {
  Order.find()
  .populate('menu._id')
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, results){
      //console.log(results)
      var customizedResult = [];
      var nonCustomizedResult = [];
      var z = 0, y = 0;
      for (var i=0; i<results.length; i++){
        for (var j=0; j<results[i].menu.length; j++){
          if (results[i].state == 'Published') {
            console.log(results[i].menu[j]);
            if (results[i].menu[j].subItems && results[i].menu[j].subItems._id != null) {
              customizedResult[y] = {
                  id : results[i]._id,
                  title : results[i].menu[j]._id.item.title,
                  date : results[i].menu[j]._id.date,
                  user : results[i].user,
                  quantity : results[i].menu[j].singleQuantity,
                  details : []
              }
              for (var k=0; k<results[i].menu[j].subItems._id.subItemsArray.length; k++)
                customizedResult[y].details.push(results[i].menu[j].subItems._id.subItemsArray[k]);
              //console.log(customizedResult[z].details);
              y++;
            }
            else{
              //console.log(results[i].menu[j].attributes);
              nonCustomizedResult[z] = {
                  id : orders[i]._id,
                  title : results[i].menu[j]._id.item.title,
                  date : results[i].menu[j]._id.date,
                  user : results[i].user,
                  quantity : results[i].menu[j].singleQuantity,
                  details : []
              }
              if (results[i].menu[j].attributes.name) {
                nonCustomizedResult[z].nameAtt = results[i].menu[j].attributes.name;
                nonCustomizedResult[z].quantityAtt = results[i].menu[j].singleQuantity;
              }
              else{
                for (var l=0; l<results[i].menu[j]._id.subItems.length; l++)
                  nonCustomizedResult[z].details.push(results[i].menu[j]._id.subItems[l]);
              }
              z++;
            }
          }
        }
      }
      console.log("-------customizedResult-------");
      console.log(nonCustomizedResult);
      res.render('orderList', {
        customizedResult : customizedResult,
        nonCustomizedResult : nonCustomizedResult
      });
    })
  });
};

exports.getOrdersByDate = function(req, res) {
  if (req.query.date)
    var dateSelected = req.query.date;
  else
    var dateSelected = undefined;
  Order.find()
  .populate('menu._id', null, {date : dateSelected})
  .populate('menu.subItems._id')
  .exec(function(err, orders) {
    Item.populate(orders, 'menu._id.item', function(err, results){
      console.log("--------getOrdersByDate--------");
      var k = 0, orderList = [];
      var z = 0;
      for (var i=0; i<results.length; i++){
        var menuList = [];
        if (results[i].state == 'Published') {
          for (var j=0; j<results[i].menu.length; j++) {
            if (results[i].menu[j]._id != null) {
              menuList.push(results[i].menu[j]);
              console.log(results[i].menu[j]);
            }
          }
          if (menuList.length > 0) {
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
      res.send(orderList);
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

exports.getViewOrder = function(req, res){
  Order.findById(req.params.id)
  .populate('address._id')
  .populate('menu._id')
  .populate('menu.subItems._id')
  .exec(function(err, order) {
    Item.populate(order, 'menu._id.item', function(err, result) {
      if(!result) res.end("No order found")
      if (!order) res.end("Order not found")
      var fullResult = [];
      for (var i=0; i<result.menu.length; i++){
        fullResult[i] = {
          id : result.menu[i]._id._id,
          title : result.menu[i]._id.item.title,
          attributes : result.menu[i].attributes
        }
      }
      console.log(result);
      res.render('viewOrder', {
        result : result,
        fullResult : fullResult //result.menu._id.
      });
    })
  });
};

exports.getEditOrder = function(req, res){
  Order.findById(req.params.id)
  .populate('address._id')
  .populate('menu._id')
  .populate('menu.subItems._id')
  .exec(function(err, order) {
    Item.populate(order, 'menu._id.item', function(err, result) {
      if(!result) res.end("No order found")
      ItemCategory.find().exec(function(err, itemCategories) {
        User.find().exec(function(err, users) {
          User.findOne({email : order.user}).exec(function(err, userFound) {
            if (!order) res.end("Order not found")
            var addressTag = [];
            for (var i=0; i<userFound.address.length; i++)
              addressTag.push(userFound.address[i]._id.tag);
            //console.log(result.menu[0]._id.item.attributes[0].cost);
            res.render('addOrder', {
              userFound : userFound,
              itemCategories: itemCategories,
              users: users,
              addressTag : addressTag,
              result : result
            });
          })
        })
      })
    })
  });
};

exports.postAddOrder = function(req, res){
  if(req.params.id){
     Order.findById(req.params.id)
     .populate('menu._id')
     .populate('menu.subItems._id')
     .exec(function(err, order){
       var previousTotal = Number(order.grandTotal);
       var allMenus = [];
       if (req.body.allMenus)
         for (var i=0; i<req.body.allMenus.length; i++){
           if(req.body.allMenus[i] != '')
             allMenus.push(req.body.allMenus[i]);
         }
       Menu.find({_id : {$in : allMenus}})
       .populate('item')
       .exec(function(err, menus){
         User.findOne({email: req.body.user})
         .populate('address._id')
         .exec(function(err, user){
           order.user= req.body.user;
           console.log("------------adding new menu-------------")
           console.log(order.menu);
           //sorting of menus
           var sortedMenus = [];
           for (var i=0; i<allMenus.length; i++)
             for (var j=0; j<menus.length; j++)
               if ( allMenus[i] == menus[j]._id )
                 sortedMenus.push(menus[j]);
           console.log(sortedMenus);
           var found = false, deletedMenuCost = 0;
           //delete deleted menus from order
           console.log(req.body.allPreMenus);
           if (req.body.allPreMenus && req.body.allPreMenus.length != order.menu.length)
             for (var z=0; z<order.menu.length; z++) {
               for (var y=0; y<req.body.allPreMenus.length; y++)
                 if (order.menu[z]._id._id == req.body.allPreMenus[y]) {
                   found = true;
                   break;
                 }
               if (!found) {
                deletedMenuCost += Number(order.menu[z].subTotal);
                order.menu.splice(z, 1);
               }
              found = false;
             }
           //adding of new menus
           var j = 0, subItemsCounter = 0;
           var totalCost = 0, subItems = [];
           if (req.body.getPosition)
             for (var i=0; i<req.body.getPosition.length; i++){
               //customized
               if (req.body.getPosition[i] == 'true') {
                 var subTotal = 0;
                 var subItems = new SubItems({
                   order : {
                     _id : order._id
                   },
                   subItemsArray : []
                 });
                 console.log("---------subItems check-----------");
                 for (var k=0; k<req.body.subItemsName[subItemsCounter].length; k++) {
                   subItems.subItemsArray.push({
                     name : req.body.subItemsName[subItemsCounter][k],
                     quantity : Number(req.body.subItemsQuantity[subItemsCounter][k]),
                     container : Number(req.body.subItemsContainer[subItemsCounter][k])
                   })
                   subTotal += req.body.subItemsQuantity[subItemsCounter][k] * req.body.subItemsCost[subItemsCounter][k];
                 }
                 order.menu.push({
                   _id : allMenus[i],
                   subItems : {
                     _id : subItems._id
                   },
                   subTotal : subTotal,
                   singleQuantity : req.body.singleQuantity[i],
                   containerType: req.body.containerType[i]
                 });
                 subItems.save(function (err) {
                   if (err) return err;
                 });
                 subItemsCounter++;
                 console.log(order.menu[i])
               }// this part has attributes - half, full
               else if (req.body.getPosition[i] == 'hasAttributes') {
                 console.log("---------cost check-----------");
                 for (var k=0; k<sortedMenus[i].item.attributes.length; k++)
                   if (sortedMenus[i].item.attributes[k].name == req.body.attributesName[j]) {
                     totalCost += sortedMenus[i].item.attributes[k].cost * req.body.singleQuantity[i];
                     var subTotal = sortedMenus[i].item.attributes[k].cost * req.body.singleQuantity[i];
                   }
                 order.menu.push({
                   _id : allMenus[i],
                   attributes : {
                     name : req.body.attributesName[j],
                     quantity : req.body.singleQuantity[i]
                   },
                   subTotal : subTotal,
                   singleQuantity : req.body.singleQuantity[i],
                   containerType: req.body.containerType[i]
                 })
                 j++;
               }//this is the non-customized part
               else {
                 order.menu.push({
                   _id : allMenus[i],
                   subTotal : Number(sortedMenus[i].item.totalCost) * req.body.singleQuantity[i],
                   singleQuantity : req.body.singleQuantity[i],
                   containerType: req.body.containerType[i]
                 })
                 totalCost += sortedMenus[i].item.totalCost;
               }
             }
           console.log("-----------cost check---------");
           console.log(totalCost);
           console.log(order.menu)
           order.grandTotal = 0;
           totalCost -= deletedMenuCost;
           totalCost += previousTotal;
           order.grandTotal += Number(totalCost);
           var newAmount = Number(user.amount);
           user.amount = 0;
           if (totalCost < previousTotal) {
             var amountToAdd = previousTotal - totalCost;
             newAmount += amountToAdd;
           }else if (totalCost > previousTotal){
             var amountToSub = totalCost - previousTotal;
             newAmount -= amountToSub;
           }
           console.log(newAmount);
           user.amount += newAmount;
           user.save(function (err) {
             if (err) return err;
           });
           var fullUserAddress = {};
           if (user.address)
             for (var i=0; i<user.address.length; i++)
               if (user.address[i]._id.tag == req.body.address) {
                 fullUserAddress = {
                   tag : user.address[i]._id.tag,
                   flatNo : user.address[i]._id.flatNo,
                   streetAddress : user.address[i]._id.streetAddress,
                   landmark : user.address[i]._id.landmark,
                   pincode : user.address[i]._id.pincode,
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
    console.log(req.body);
    var allMenus = [];
    console.log(req.body.allMenus)
    for (var i=0; i<req.body.allMenus.length; i++){
      if(req.body.allMenus[i] != '')
        allMenus.push(req.body.allMenus[i]);
    }
    console.log(allMenus)
    Menu.find({_id : {$in : allMenus}})
    .populate('item')
    .exec(function(err, menus){
      User.findOne({email: req.body.user})
      .populate('address._id')
      .exec(function(err, user){
        var order = new Order({
          user: req.body.user
        })
        console.log(menus)
        console.log("-------------get position started------------")
        //sorting of menus
        var sortedMenus = [];
        for (var i=0; i<allMenus.length; i++){
          for (var j=0; j<menus.length; j++){
            if ( allMenus[i] == menus[j]._id )
              sortedMenus.push(menus[j]);
          }
        }
        console.log(sortedMenus);
        console.log(req.body.getPosition);
        console.log(order._id);
        console.log("-------subItems------");
        var j = 0, subItemsCounter = 0;
        var totalCost = 0, subItems = [];
        for (var i=0; i<req.body.getPosition.length; i++){
          //customized
          var subTotal = 0;
          if (req.body.getPosition[i] == 'true') {
            var subItems = new SubItems({
              order : {
                _id : order._id
              },
              subItemsArray : []
            });
            console.log("---------subItems check-----------");
            for (var k=0; k<req.body.subItemsName[subItemsCounter].length; k++) {
              subItems.subItemsArray.push({
                name : req.body.subItemsName[subItemsCounter][k],
                quantity : Number(req.body.subItemsQuantity[subItemsCounter][k]),
                container : Number(req.body.subItemsContainer[subItemsCounter][k])
              })
              subTotal += req.body.subItemsQuantity[subItemsCounter][k] * req.body.subItemsCost[subItemsCounter][k];
            }
            console.log(subItems);
            order.menu.push({
              _id : allMenus[i],
              subItems : {
                _id : subItems._id
              },
              subTotal : subTotal * req.body.singleQuantity[i],
              singleQuantity : req.body.singleQuantity[i],
              containerType: req.body.containerType[i]
            });
            totalCost += subTotal * req.body.singleQuantity[i];
            subItems.save(function (err) {
              if (err) return err;
            });
            subItemsCounter++;
            console.log(order.menu[i])
          }// this part has attributes - half, full
          else if (req.body.getPosition[i] == 'hasAttributes') {
            console.log("---------cost check-----------");
            for (var k=0; k<sortedMenus[i].item.attributes.length; k++)
              if (sortedMenus[i].item.attributes[k].name == req.body.attributesName[j])
                subTotal += sortedMenus[i].item.attributes[k].cost * req.body.singleQuantity[i];
            order.menu.push({
              _id : allMenus[i],
              attributes : {
                name : req.body.attributesName[j],
                //quantity : req.body.attributesQuantity[j]
              },
              subTotal : subTotal * req.body.singleQuantity[i],
              singleQuantity : req.body.singleQuantity[i],
              containerType: req.body.containerType[i]
            })
            totalCost += subTotal * req.body.singleQuantity[i];
            j++;
          }//this is the non-customized part
          else {
            order.menu.push({
              _id : allMenus[i],
              subTotal : Number(sortedMenus[i].item.totalCost) * req.body.singleQuantity[i],
              singleQuantity : req.body.singleQuantity[i],
              containerType: req.body.containerType[i]
            })
            totalCost += Number(sortedMenus[i].item.totalCost) * req.body.singleQuantity[i];
          }
        }
        console.log(totalCost);
        console.log(order.menu)
        console.log(order.menu.subItems)
        order.grandTotal = 0;
        order.grandTotal += totalCost;
        //order address
        order.address = {};
        if (user.address)
          for (var i=0; i<user.address.length; i++)
            if (user.address[i]._id.tag == req.body.address)
              order.address = user.address[i]._id;
        order.save(function (err) {
          if (err) return err;
        });
        var newAmount = Number(user.amount);
        user.amount = 0;
        newAmount -= totalCost;
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
    User.findOne({email : req.params.userEmail}).exec(function(err, user){
      if(err) return err;
      console.log(order)
      user.amount += order.grandTotal;
      order.state = 'Archieved';
      user.save(function(err){
        if (err) return err
      });
      order.save(function(err){
        if (err) return err
      });
      res.redirect('/orderList');
    });
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
  .populate('item')
  .exec(function(err, menusList){
      var menusListJson = []
      console.log(menusList);
      if (menusList)
        for(var i=0; i<menusList.length; i++){
          menusListJson[i] = {
            id: menusList[i]._id,
            item: menusList[i].item.title
          }
          if (menusList[i].subItems.length > 0)
            menusListJson[i].checked = false;
          else if (menusList[i].item.attributes.length > 0)
            menusListJson[i].checked = "hasAttributes";
          else
            menusListJson[i].checked = "normal";
          console.log(menusListJson[i].checked);
        }
      res.send(menusListJson);
  });
};

//ajax get user addresses
exports.getUserAddress = function(req, res){
  if(req.query.userEmail) var userEmail = req.query.userEmail
  User.findOne({email: userEmail})
  .populate('address._id')
  .exec(function(err, user){
    console.log(user);
    var userJson = [];
    if (user.address)
      for(var i=0; i<user.address.length; i++)
        userJson[i] = {
          address : user.address[i]._id.tag,
          flatNo : user.address[i]._id.flatNo,
          streetAddress : user.address[i]._id.streetAddress,
          landmark : user.address[i]._id.landmark,
          pincode : user.address[i]._id.pincode,
          contactNo : user.contactNo
        }
    if (userJson.length == 0)
      userJson[0] = {
        amount: 0
      }
    else
      userJson[0].amount = user.amount;
    console.log(userJson)
    res.send(userJson);
  })
};

//ajax get Customized Menu To Item
exports.getCustomizedMenuToItem = function(req, res) {
  console.log(req.query.id);
  Menu.findById(req.query.id)
  .populate('item')
  .exec(function(err, menu){
    console.log("--------getCustomizedMenuToItem----------")
    console.log(menu);
    var subItemsAttributes = [];
    if(menu.subItems.length != 0){
      console.log("subItems found");
      for (var i=0; i<menu.subItems.length; i++)
        subItemsAttributes[i] = {
          name : menu.subItems[i].name,
          quantity : menu.subItems[i].quantity,
          cost : menu.subItems[i].cost,
          container :menu.subItems[i].container
        }
    }else if(menu.item.attributes.length != 0){
      console.log("attributes found")
      for (var i=0; i<menu.item.attributes.length; i++)
        subItemsAttributes[i] = {
          name : menu.item.attributes[i].name,
          cost : menu.item.attributes[i].cost
        }
    }

    res.send(subItemsAttributes);
  });
};

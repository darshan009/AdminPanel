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
      console.log(results)
      var customizedResult = [];
      var nonCustomizedResult = [];
      var z = 0;
      for (var i=0; i<results.length; i++){
        for (var j=0; j<results[i].menu.length; j++){
          if (results[i].menu[j].subItems.length > 0)
            customizedResult[z] = {
                id : orders[i]._id,
                title : results[i].menu[j]._id.item.title,
                date : results[i].menu[j]._id.date,
                user : results[i].user
                //details : results[i].menu[j].subItems
            }
          else{
            nonCustomizedResult[z] = {
                id : orders[i]._id,
                title : results[i].menu[j]._id.item.title,
                date : results[i].menu[j]._id.date,
                user : results[i].user
            }
            if (results[i].menu[j].attributes.name)
              nonCustomizedResult[z].details = results[i].menu[j].attributes.name;
            else{
              //nonCustomizedResult[z].details = results[i].menu[j]._id.item
            }
          }
          z++;
        }
      }
      console.log("-------end-------")
      console.log(customizedResult)
      console.log(nonCustomizedResult)
      res.json(
        customizedResult,
        nonCustomizedResult
);
    })
  });
};

exports.getAddOrder = function(req, res){
  ItemCategory.find().exec(function(err, itemCategories) {
    User.find().exec(function(err, users) {
      res.json(
        itemCategories,
        users
      );
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
            for (var i=0; i<result.menu.length; i++){
              fullResult[i] = {
                id : result.menu[i]._id._id,
                title : result.menu[i]._id.item.title,
                attributes : result.menu[i].attributes
              }
              if (result.menu[i].subItems.length > 0)
                fullResult[i].getPosition = false;
              else if (result.menu[i].attributes.name)
                fullResult[i].getPosition = "hasAttributes";
              else
                fullResult[i].getPosition = "normal"
            }
            var addressTag = [];
            for (var i=0; i<userFound.address.length; i++)
              addressTag.push(userFound.address[i].tag);
            console.log(result);
            res.json(
              itemCategories,
              users,
              addressTag,
              result,
              fullResult
            );
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
          /*-------------------adding in cost--------------
          var totalCostToSub = 0;
          var orderMenuFound = [];
          for (var i=0; i<order.menu.length; i++) {
            for (var j=0; j<menus.length; j++){
              if ((menus[j]._id).toString() == (order.menu[i]._id).toString())
                orderMenuFound.push(order.menu[i]._id)
            }
          }

          for (var i=0; i<order.menu.length; i++) {

          }
          totalCostToSub += menus[j].item.totalCost;
          var newAmount = Number(user.amount);
          user.amount = 0;
          newAmount -= totalCostToSub;
          user.amount = newAmount;
          user.save(function (err) {
            if (err) return err;
          });
          * ------------adding cost-------------
          */
          console.log("------------adding new menu-------------")
          console.log(order.menu);
          console.log(req.body.attributesName)
          console.log(req.body.preAttributesName)
          order.menu = [];
          var j = 0;
          var k = 0;
          for (var i=0; i<req.body.getPosition.length; i++) {
            //customized
            if (req.body.getPosition[i] == 'true') {
              //yet to get a solution ---- subItems
            }// this part has attributes - half, full
            else if (req.body.getPosition[i] == 'hasAttributes') {
              if (i > req.body.preAttributesName.length){
                order.menu.push({
                  _id : allMenus[i],
                  attributes : {
                    name : req.body.attributesName[j],
                    quantity : req.body.attributesQuantity[j]
                  }
                })
                j++;
              }else {
                order.menu.push({
                  _id : allMenus[i],
                  attributes : {
                    name : req.body.preAttributesName[k],
                    quantity : req.body.preAttributesQuantity[k]
                  }
                })
                k++;
              }
            }//this is the non-customized part
            else {
              order.menu.push({
                _id : allMenus[i]
              })
            }
          }
          console.log(order.menu)
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
        //for customized orders
        console.log("-------------get position started------------")
        console.log(req.body.getPosition.length)
        console.log(req.body.attributesName)
        console.log(req.body.attributesQuantity)
        // -------------- old adding of subItems--------------------
        // var subItems = [];
        // for (var i=0; i<req.body.getPosition.length; i++){
        //   if(req.body.subItemsName){
        //     order.menu[i] = {
        //       _id : allMenus[req.body.getPosition[i]],
        //       subItems : [],
        //     }
        //     console.log(order.menu[i]);
        //     for (var j=0; j<req.body.subItemsName[i].length; j++)
        //       order.menu[i].subItems[j] = {
        //         name : req.body.subItemsName[i][j],
        //         quantity : Number(req.body.subItemsQuantity[i][j]),
        //         container : Number(req.body.subItemsContainer[i][j])
        //       }
        //     //order.menu[i].subItems = subItems;
        //     console.log(order.menu[i].subItems)
        //   }
        // }
        //-----------------new adding of customized part-------------
        console.log(order.menu);
        console.log(req.body.getPosition);
        console.log(allMenus);
        var j = 0;
        for (var i=0; i<req.body.getPosition.length; i++){
          //customized
          if (req.body.getPosition[i] == 'true'){
            //yet to get a solution
          }// this part has attributes - half, full
          else if (req.body.getPosition[i] == 'hasAttributes') {
            order.menu.push({
              _id : allMenus[i],
              attributes : {
                name : req.body.attributesName[j],
                quantity : req.body.attributesQuantity[j]
              }
            })
            j++;
          }//this is the non-customized part
          else {
            order.menu.push({
              _id : allMenus[i]
            })
          }
        }
        console.log(order.menu)
        console.log(order.menu.subItems)
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
        // var totalCostToSub = 0;
        // if (menus)
        //   for (var i=0; i<menus.length; i++) {
        //     totalCostToSub += menus[i].item.totalCost;
        //   }
        // var newAmount = Number(user.amount);
        // user.amount = 0;
        // newAmount -= totalCostToSub;
        // user.amount = newAmount;
        // user.save(function (err) {
        //   if (err) return err;
        // });
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
  .populate('item')
  .exec(function(err, menusList){
      var menusListJson = []
      console.log(menusList);
      for(var i=0; i<menusList.length; i++){
        menusListJson[i] = {
          id: menusList[i]._id,
          item: menusList[i].item.title
        }
        if (menusList[i].item.subItems.length > 0)
          menusListJson[i].checked = false;
        else if (menusList[i].item.attributes)
          menusListJson[i].checked = "hasAttributes";
        else
          menusListJson[i].checked = "normal"
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

//ajax get Customized Menu To Item
exports.getCustomizedMenuToItem = function(req, res) {
  console.log(req.query.id);
  Menu.findById(req.query.id)
  .populate('item')
  .exec(function(err, menu){
    console.log("--------getCustomizedMenuToItem----------")
    console.log(menu);
    var subItemsAttributes = [];
    if(menu.item.subItems.length != 0){
      console.log("subItems found");
      for (var i=0; i<menu.item.subItems.length; i++)
        subItemsAttributes[i] = {
          name : menu.item.subItems[i].name,
          quantity : menu.item.subItems[i].quantity,
          cost : menu.item.subItems[i].cost,
          container :menu.item.subItems[i].container
        }
    }
    if(menu.item.attributes.length != 0){
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

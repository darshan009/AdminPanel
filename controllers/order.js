var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Order = require('../models/Order');
var Menu = require('../models/Menu');

/*
 |-----------------------------------------------------------
 | Order CRUD operations
 |-----------------------------------------------------------
 */
exports.getOrderList = function(req, res) {
  Order.find()
  .populate('menu._id')
  .exec(function(err, orders) {
    if (err) {
      return err;
    }
    var resultToDisplay = [], z = 0, y = 0;
    for (var i=0; i<orders.length; i++){
      for (var j=0; j<orders[i].menu.length; j++){
        if (orders[i].state == 'Published') {
          resultToDisplay[z] = {
              id : orders[i]._id,
              title : orders[i].menu[j]._id.title,
              date : orders[i].date.toDateString(),
              user : orders[i].user,
              quantity : orders[i].menu[j].singleQuantity,
              details : []
          }
          if (orders[i].menu[j].attributes.name) {
            resultToDisplay[z].nameAtt = orders[i].menu[j].attributes.name;
            resultToDisplay[z].quantityAtt = orders[i].menu[j].singleQuantity;
          }
          z++;
        }
      }
    }
    res.render('orderList', {
      resultToDisplay : resultToDisplay
    });
  });
};

exports.getAddOrder = function(req, res){
  ItemCategory.find().exec()
    .then(function(itemCategories) {
      return [itemCategories];
    })
    .then(function(result){
      return User.find().exec()
        .then(function(users){
          result.push(users);
          return result;
        })
    })
    .then(function(result){
      var itemCategories = result[0],
          users = result[1];
      res.render('addOrder', {
        itemCategories: itemCategories,
        users: users
      });
    })
    .then(undefined, function(err){
      console.log(err);
    })
};

exports.getViewOrder = function(req, res){
  Order.findById(req.params.id)
  .populate('address._id')
  .populate('menu._id')
  .exec(function(err, order) {
    if (err) {
      return err;
    }
    if(!order)
      res.end("No order found");
    res.render('viewOrder', {
      result : order
    });
  });
};

exports.getEditOrder = function(req, res){
  Order.findById(req.params.id)
    .populate('address._id')
    .populate('menu._id')
    .exec()
    .then(function(order) {
      return [order];
    })
    .then(function(result){
      return ItemCategory.find().exec()
        .then(function(itemCategories){
          result.push(itemCategories);
          return result;
        })
    })
    .then(function(result){
      return User.find().exec()
        .then(function(users){
          result.push(users);
          return result;
        })
    })
    .then(function(result){
      return User.findOne({email : result[0].user}).exec()
        .then(function(userFound) {
          var addressTag = [];
          for (var i=0; i<userFound.address.length; i++)
            addressTag.push(userFound.address[i]._id.tag);
          result.push(userFound);
          result.push(addressTag);
          return result;
      })
    })
    .then(function(result){
      res.render('addOrder', {
        userFound : result[3],
        itemCategories: result[1],
        users: result[2],
        addressTag : result[4],
        result : result[0]
      });
    })
    .then(undefined, function(error){
      console.log(error);
    })
};

exports.postAddOrder = function(req, res){
  if(req.params.id){ // POST Edit Order
    console.log(req.body);
     Order.findById(req.params.id)
     .populate('menu._id')
     .exec(function(err, order){
       if (err) {
         return err;
       }

       var previousTotal = order.grandTotal, allMenus = [];
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

           //sorting of menus in same order as added by user
           var sortedMenus = [], found = false, deletedMenuCost = 0;
           for (var i=0; i<allMenus.length; i++)
             for (var j=0; j<menus.length; j++)
               if ( allMenus[i] == menus[j]._id )
                 sortedMenus.push(menus[j]);
           console.log(sortedMenus);

           //delete deleted menus from order
           console.log(req.body.allPreMenus);
           if (req.body.allPreMenus && req.body.allPreMenus.length != order.menu.length)
             for (var z=0; z<order.menu.length; z++) {
               for (var y=0; y<req.body.allPreMenus.length; y++)
                 if (order.menu[z]._id == req.body.allPreMenus[y]) {
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
           var j = 0, subItemsCounter = 0, totalCost = 0, subItems = [];
           if (req.body.getPosition) {
             for (var i=0; i<req.body.getPosition.length; i++){

               //menu has subItems
               if (req.body.getPosition[i] == 'true') {
                 var subTotal = 0;
                 var subItems = new SubItems({
                   order : {
                     _id : order._id
                   },
                   subItemsArray : []
                 });
                 console.log("---------subItems check-----------");
                 for (var k=0; k<subItemsId[subItemsCounter].length; k++) {
                   subTotal += req.body.subItemsQuantity[subItemsCounter][k] * req.body.subItemsCost[subItemsCounter][k];
                   order.menu.push({
                     _id: req.body.subItemsId[subItemsCounter][k],
                     subTotal : subTotal * req.body.subItemsQuantity[subItemsCounter][k],
                     singleQuantity : req.body.singleQuantity[i],
                     containerType: req.body.containerType[i]
                   })
                 }
                 subItemsCounter++;
                 totalCost += subTotal * req.body.singleQuantity[i];
               }
               else if (req.body.getPosition[i] == 'hasAttributes') { // this part has attributes - half, full
                 console.log("---------cost check-----------");
                 for (var k=0; k<sortedMenus[i].item.attributes.length; k++)
                   if (sortedMenus[i].item.attributes[k].name == req.body.attributesName[j]) {
                     totalCost += sortedMenus[i].item.attributes[k].cost * req.body.singleQuantity[i];
                     var subTotal = sortedMenus[i].item.attributes[k].cost * req.body.singleQuantity[i];
                   }
                 order.menu.push({
                   _id : sortedMenus[i].item._id,
                   attributes : {
                     name : req.body.attributesName[j],
                     quantity : req.body.singleQuantity[i]
                   },
                   subTotal : subTotal,
                   singleQuantity : req.body.singleQuantity[i],
                   containerType: req.body.containerType[i]
                 })
                 totalCost += subTotal * req.body.singleQuantity[i];
                 j++;
               }
               else { //this is the non-customized part
                 order.menu.push({
                   _id : sortedMenus[i].item._id,
                   subTotal : Number(sortedMenus[i].item.totalCost) * req.body.singleQuantity[i],
                   singleQuantity : req.body.singleQuantity[i],
                   containerType: req.body.containerType[i]
                 })
                 totalCost += sortedMenus[i].item.totalCost * req.body.singleQuantity[i];
               }
             }
           }//end of get position
           console.log("-----------cost check---------");

           //add or subtract of user amount
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

           //calculating grandTotal for order
           totalCost -= deletedMenuCost;
           totalCost += previousTotal;
           order.grandTotal = 0;
           order.grandTotal += Number(totalCost);

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
  else { //POST new order
    console.log(req.body);

    var subItemsId = req.body.subItemsId,
        subItemsQuantity = req.body.subItemsQuantity,
        subItemsCost = req.body.subItemsCost,
        subItemsContainer = req.body.subItemsContainer
    for (var i=0; i < req.body.getPosition.length; i++) {
      if (req.body.getPosition[i] == 'false') {
        subItemsId.splice(i, 0, '');
        subItemsQuantity.splice(i, 0, '');
        subItemsCost.splice(i, 0, '');
        subItemsContainer.splice(i, 0, '');
      }
    }

    var allMenus = [];
    for (var i=0; i<req.body.allMenus.length; i++){
      if(req.body.allMenus[i] != '')
        allMenus.push(req.body.allMenus[i]);
    }
    console.log(allMenus);

    Menu.find({_id : {$in : allMenus}})
    .populate('item')
    .exec(function(err, menus){
      User.findOne({email: req.body.user})
      .populate('address._id')
      .exec(function(err, user){
        if (err) {
          return err;
        }

        //console.log(menus)
        console.log("-------------get position started------------")

        //sorting of menus in same order as added by user
        var sortedMenus = [];
        for (var i=0; i<allMenus.length; i++){
          for (var j=0; j<menus.length; j++){
            if ( allMenus[i] == menus[j]._id )
              sortedMenus.push(menus[j]);
          }
        }

        //for orders for different dates & meal
        var positions = [], outerArrayCount = 0, uniquePositions = [], addOnce, eql;
        loop1:
        for (var q=0; q<sortedMenus.length; q++) {
          addOnce = true, eql = false;
          if (uniquePositions.indexOf(q) > -1) {
            continue loop1;
          }
          loop2:
          for (var p=q+1; p<sortedMenus.length; p++) {
            if (sortedMenus[q].date.toDateString() == sortedMenus[p].date.toDateString() && sortedMenus[q].meal == sortedMenus[p].meal) {
              if (addOnce) {
                positions[outerArrayCount] = [];
                positions[outerArrayCount].push(q);
                addOnce = false;
                eql = true;
                uniquePositions.push(q);
              }
              positions[outerArrayCount].push(p);
              uniquePositions.push(p);
            }
          }
          if (!eql) {
            positions[outerArrayCount] = [];
            positions[outerArrayCount].push(q);
          }
          outerArrayCount++;
        }
        console.log(uniquePositions);
        console.log(positions);

        /*
         |-----------------------------------------------------------
         | Start of adding order for each date
         |-----------------------------------------------------------
         */
        for (var s=0; s<positions.length; s++) { //per date(outer loop), positions - [ [ [''], [''] ], [ [''], [''] ] ]

          //creating new order for every date
          var order = new Order({
            user: req.body.user,
            date: sortedMenus[positions[s][0]].date,
            meal: sortedMenus[positions[s][0]].meal
          })

          for (var t=0; t<positions[s].length; t++) {
            var j = 0, totalCost = 0, subTotal = 0;

            //orders with subitems
            if (req.body.getPosition[positions[s][t]] == 'true') {
              console.log("---------subItems as seperate items-----------");
              for (var k=0; k<subItemsId[positions[s][t]].length; k++) {
                subTotal += subItemsQuantity[positions[s][t]][k] * subItemsCost[positions[s][t]][k];
                order.menu.push({
                  _id : subItemsId[positions[s][t]][k],
                  singleQuantity : Number(subItemsQuantity[positions[s][t]][k]),
                  containerType: req.body.containerType[positions[s][t]],
                  subTotal : subTotal * subItemsQuantity[positions[s][t]],
                })
              }
              totalCost += subTotal * req.body.singleQuantity[positions[s][t]];
              console.log(order.menu[positions[s][t]])
            }
            else if (req.body.getPosition[positions[s][t]] == 'hasAttributes') { // this part has attributes - half, full

              for (var k=0; k<sortedMenus[positions[s][t]].item.attributes.length; k++)
                if (sortedMenus[positions[s][t]].item.attributes[k].name == req.body.attributesName[j]) {
                  subTotal += sortedMenus[positions[s][t]].item.attributes[k].cost * req.body.singleQuantity[positions[s][t]];
                  var container = sortedMenus[positions[s][t]].item.attributes[k].container;
                }
              order.menu.push({
                _id : sortedMenus[positions[s][t]].item._id,
                attributes : {
                  name : req.body.attributesName[j],
                  //quantity : req.body.attributesQuantity[j],
                  container : container
                },
                subTotal : subTotal * req.body.singleQuantity[positions[s][t]],
                singleQuantity : req.body.singleQuantity[positions[s][t]],
                containerType: req.body.containerType[positions[s][t]]
              })
              totalCost += subTotal * req.body.singleQuantity[positions[s][t]];
              j++;
            }
            else { //the non-customized part
              order.menu.push({
                _id : sortedMenus[positions[s][t]].item._id,
                subTotal : Number(sortedMenus[positions[s][t]].item.totalCost) * req.body.singleQuantity[positions[s][t]],
                singleQuantity : req.body.singleQuantity[positions[s][t]],
                containerType: req.body.containerType[positions[s][t]]
              })
              totalCost += Number(sortedMenus[positions[s][t]].item.totalCost) * req.body.singleQuantity[positions[s][t]];
            }
          }// ----- end of orders for a date

          console.log(totalCost);
          console.log(order.menu)

          order.grandTotal = 0;
          order.grandTotal += totalCost;

          //order address
          order.address = {};
          if (user.address)
            for (var z=0; z<user.address.length; z++)
              if (user.address[z]._id.tag == req.body.address)
                order.address = user.address[z]._id;

          //deduct user amount
          var newAmount = Number(user.amount);
          user.amount = 0;
          newAmount -= totalCost;
          user.amount = newAmount;
          user.save(function (err) {
            if (err) return err;
          });
          order.save(function (err) {
            if (err) return err;
          });
        }
        res.redirect('/orderList');
      });
    });
  }//end of else part
};

exports.deleteOrder = function(req,res){
  Order.findById(req.params.id).exec()
    .then(function(order){
      order.state = 'Archieved';
      order.save(function(err){
        if (err)
          return err;
      });
      return order;
    })
    .then(function(order){
      return User.findOne({email: req.params.userEmail}).exec()
        .then(function(user){
          user.amount += order.grandTotal;
          user.save(function(err){
            if (err)
              return err;
          });
        })
    })
    .then(function(){
      res.redirect('/orderList');
    })
    .then(undefined, function(err){
      console.log(err);
    })
};


/*
 |-----------------------------------------------------------
 | AJAX call to get orders by date in list of orders
 |-----------------------------------------------------------
*/
exports.getOrdersByDate = function(req, res) {
  Order.find({date : req.query.date})
  .populate('menu._id')
  .exec(function(err, orders) {
    if (err) {
      return err;
    }
    var k = 0, orderList = [], menuList = [];
    for (var i=0; i<orders.length; i++){
      menuList = [];
      if (orders[i].state == 'Published') {
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
    res.send(orderList);
  });
};

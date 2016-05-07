var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Menu = require('../models/Menu')

/*
 |-----------------------------------------------------------
 | Menu CRUD operations
 |-----------------------------------------------------------
 */
exports.getMenuList = function(req, res){
  Menu.find()
  .populate('item')
  .exec(function(err, menu) {
    if (err) {
      return err;
    }
    res.render('menuList', {menu : menu});
  });
};

exports.getAddMenu = function(req, res){
  Menu.findById(req.params.id)
    .populate('item')
    .populate('category')
    .populate('subItems')
    .exec()
    .then(function(menu){
      return [menu];
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
      return Item.find().exec()
        .then(function(items){
          result.push(items);
          return result;
        })
    })
    .then(function(result){
      res.render('addMenu', {
        menu: result[0],
        itemCategories: result[1],
        users: result[2],
        items: result[3]
      });
    })
    .then(undefined, function(error){
      console.log(error);
    })
};

exports.postAddMenu = function(req, res){
  if(req.params.id){
    Menu.findById(req.params.id).exec(function(err, menu){
      if (err) {
        return err;
      }
      menu.date= req.body.date;
      menu.meal= req.body.meal;
      menu.category= req.body.category;
      menu.item= req.body.itemSelected;
      menu.subItems = [];
      var locals = req.body, totalCost = 0;
      if (locals.name)
        for(var i=0; i<locals.name.length; i++) {
          menu.subItems.push(locals.name[i]);
          totalCost += Number(locals.cost[i]) * Number(locals.quantity[i]);
        }
      menu.totalCost = 0;
      menu.totalCost += totalCost;
      menu.save(function (err) {
        if (err)
          return err;
      });
      res.redirect('/menuList');
    });
  }
  else {
    var menu = new Menu({
      date: req.body.date,
      meal: req.body.meal,
      category: req.body.category,
      item: req.body.itemSelected
    })
    menu.subItems = [];
    var locals = req.body, totalCost = 0;
    if (locals.name)
      for(var i=0; i<locals.name.length; i++) {
        menu.subItems.push(locals.name[i]);
        totalCost += Number(locals.cost[i]) * Number(locals.quantity[i]);
      }
    menu.totalCost = totalCost;
    menu.save(function (err) {
      if (err)
        return err;
    })
    res.redirect('/menuList');
  }
};

exports.deleteMenu = function(req, res){
  Menu.findById(req.params.id).exec(function(err, menu){
    if (err) {
      return err;
    }
    menu.remove();
    res.redirect('/menuList');
  });
};

/*
 |---------------------------------------------------------------
 | AJAX call to get all items from selected category in add Menu
 |---------------------------------------------------------------
*/
exports.getItemsFromCategory = function(req, res){
  Item.find({category: req.query.q}).exec(function(err, itemsList){
    if (err) {
      return err;
    }
    var itemsListJson = []
    for(var i=0; i<itemsList.length; i++){
      itemsListJson[i] = {
        id: itemsList[i]._id,
        title: itemsList[i].title
      }
    }
    res.send(itemsListJson);
  })
};

exports.getItemListForMenu = function(req, res){
  Item.find()
  .exec(function(err, items){
    if (err) {
      return err;
    }
    res.send(items);
   })
};

/*
 |-----------------------------------------------------------
 | AJAX call to get menus for selected date and meal in add Order
 | GET /getMenusFromOptions
 |-----------------------------------------------------------
*/
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
      if (err) {
        return err;
      }
      var menusListJson = []
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
        }
      res.send(menusListJson);
  });
};

/*
 |-----------------------------------------------------------
 | AJAX call on customize button click in add Order
 | GET /getCustomizedMenuToItem
 |-----------------------------------------------------------
*/
exports.getCustomizedMenuToItem = function(req, res) {
  Menu.findById(req.query.id)
  .populate('item')
  .populate('subItems')
  .exec(function(err, menu){
    if (err) {
      return err;
    }
    console.log("--------getCustomizedMenuToItem----------");
    var subItemsAttributes = [];
    if(menu.subItems.length != 0){
      console.log("subItems found");
      for (var i=0; i<menu.subItems.length; i++)
        subItemsAttributes.push({
          id: menu.subItems[i]._id,
          name : menu.subItems[i].title,
          quantity : menu.subItems[i].quantity,
          cost : menu.subItems[i].totalCost,
          container :menu.subItems[i].container
        })
    }else if(menu.item.attributes.length != 0){
      console.log("attributes found")
      for (var i=0; i<menu.item.attributes.length; i++)
        subItemsAttributes.push({
          name : menu.item.attributes[i].name,
          cost : menu.item.attributes[i].cost
        })
    }
    res.send(subItemsAttributes);
  });
};

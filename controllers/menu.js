var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Menu = require('../models/Menu')
//controllers
exports.getMenuList = function(req, res){
  Menu.find().exec(function(err, menus){
    var menusItem = [];
    for(var i=0; i<menus.length; i++)
      menusItem.push(menus[i].item);
    Item.find({_id: {$in: menusItem}}).exec(function(err, items){
      if(menus) {
        var menuAndItem = [];
        for(var i=0; i<menus.length; i++) {
          menuAndItem[i] = {
            id : menus[i]._id,
            user : menus[i].user,
            date : menus[i].date,
            item : items[i].title
          }
        }
        res.render('menuList', {menu : menuAndItem});
      }
    })
  });
};

exports.getAddMenu = function(req, res){
  Menu.findById(req.params.id).exec(function(err, menu){
    ItemCategory.find().exec(function(err, itemCategories){
      User.find().exec(function(err, users){
        Item.findById(menu.item).exec(function(err, item){
          res.render('addMenu', {menu: menu, itemCategories: itemCategories, users: users, item: item});
        })
      })
    })
  });
};

exports.postAddMenu = function(req, res){
  if(req.params.id){
    Menu.findById(req.params.id).exec(function(err, menu){
      itemCategory.name = req.body.name;
      itemCategory.save(function (err) {
          if (err) return err
      });
      res.redirect('/menuList');
    });
  }
  else {
    Item.findById(req.body.itemSelected).exec(function(err, item){
      var menu = new Menu({
        date: req.body.date,
        meal: req.body.meal,
        category: req.body.category,
        item: item._id,
        user: req.body.user
      })
      menu.save(function (err) {
        if (err) return err;
      })
      res.redirect('/menuList');
    })
  }
};

exports.deleteMenu = function(req,res){
  Menu.findById(req.params.id).exec(function(err, menu){
    if(err) return err;
    menu.remove();
    res.redirect('/menuList');
  });
};

//ajax populate itemList select box
exports.getItemsFromCategory = function(req, res){
  ItemCategory.findOne({name:req.query.q}).exec(function(err, itemCategory){
    Item.find({category: itemCategory._id}).exec(function(err, itemsList){
      var itemsListJson = []
      for(var i=0; i<itemsList.length; i++){
        itemsListJson[i] = {
          id: itemsList[i]._id,
          title: itemsList[i].title
        }
      }
      res.send(itemsListJson);
    })
  })
};

var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item');
var User = require('../models/User');
var Menu = require('../models/Menu')

//controllers
exports.getMenuList = function(req, res){
  Menu.find()
  .populate('item')
  .exec(function(err, menu) {
    res.render('menuList', {menu : menu});
  });
};

exports.getAddMenu = function(req, res){
  Menu.findById(req.params.id).exec(function(err, menu){
    ItemCategory.find().exec(function(err, itemCategories){
      User.find().exec(function(err, users){
        if(req.params.id) var menuItem = menu.item;
        Item.findById(menuItem).exec(function(err, item){
          res.json( menu, itemCategories, users,  item);
        })
      })
    })
  });
};

exports.postAddMenu = function(req, res){
  if(req.params.id){
    Menu.findById(req.params.id).exec(function(err, menu){
      Item.findById(req.body.itemSelected).exec(function(err, item){
        menu.date= req.body.date;
        menu.meal= req.body.meal;
        menu.category= req.body.category;
        menu.item= item._id;
        menu.save(function (err) {
            if (err) return err
        });
        res.redirect('/menuList');
      });
    });
  }
  else {
    Item.findById(req.body.itemSelected).exec(function(err, item){
      var menu = new Menu({
        date: req.body.date,
        meal: req.body.meal,
        category: req.body.category,
        item: item._id
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

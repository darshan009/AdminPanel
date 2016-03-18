var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item.js');
var User = require('../models/User.js');
/*
 *
 *  Item category
 *
 */
exports.getItemCategories = function(req, res, next){
  ItemCategory.find().exec(function(err, itemCategories){
    res.render('categoryList', {itemCategories: itemCategories});
  });
};

exports.getAddItemCategory = function(req, res, next){
  if(req.params.id){
    ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
      res.render('addCategory', {itemCategory: itemCategory});
    });
  }else
    res.render('addCategory');
};

exports.postAddItemCategory = function(req, res, next){
  if(req.params.id){
    ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
      itemCategory.name = req.body.name;
      itemCategory.save(function (err) {
          if (err) return err
      });
      res.redirect('/categoryList');
    });
  }
  else {
    var itemCategory = new ItemCategory({
      name: req.body.name
    });
    itemCategory.save(function (err) {
      if (err) return err
    })
    res.redirect('/categoryList');
  }
};

exports.deleteItemCategory = function(req,res){
  ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
    if(err) return err;
    itemCategory.remove();
    res.redirect('/categoryList');
  });
};


/*
 *
 *  Items
 *
 */
 exports.getItemList = function(req, res, next){
   Item.find().exec(function(err, items){
     var findAllCategories = []
     for(var i=0; i<items.length; i++)
        findAllCategories.push(items[i].category);
     ItemCategory.find({_id: {$in: findAllCategories}}).exec(function(err, itemCategory){
       var completeItemList = [];
       for(var i=0; i<items.length; i++){
         completeItemList[i] = {
           _id: items[i]._id,
           title: items[i].title,
           state: items[i].state,
           chef: items[i].chef,
           type: items[i].type,
           category: itemCategory[i].name
         }
       }
      res.render('itemList', {completeItemList: completeItemList});
    })
  });
 };

 exports.getAddItem = function(req, res, next){
   Item.findById(req.params.id).exec(function(err, item){
     User.find({type: 'Chef'}).exec(function(err, userChef){
       if(req.params.id) var paramsChef = item.chef;
       User.findById(paramsChef).exec(function(err, paramsUserChef){
         ItemCategory.find().exec(function(err, itemCategories){
           if (item) var paramsItemCategory = item.category;
           ItemCategory.findById(paramsItemCategory).exec(function(err, itemCategory){
             if(err) return next(err);
             res.render('addItem', {
               item: item,
               userChef: userChef,
               itemCategories: itemCategories,
               itemCategory: itemCategory,
               paramsUserChef: paramsUserChef
             });
           })
         })
       });
     });
   });
 };

 exports.postAddItem = function(req, res, next){
   if(req.params.id){
     Item.findById(req.params.id).exec(function(err, item){
         if (err)
           return next(err);
         item.save(function (err) {
             if (err) return err
         });
         res.redirect('/userList');
     });
   }else{
     ItemCategory.findOne({name: req.body.category}).exec(function(err, itemCategory){
       User.findOne({email: req.body.chefEmail}).exec(function(err, userChef){
         if (err) return err;
         if(!itemCategory) res.end("The enetered category is not valid");
         if(!userChef) res.end("Chef does not exist");
         var locals = req.body;
         var attributes = [];
         for(var i=0; i<locals.name.length; i++){
           attributes[i] = {
             name : locals.name[i],
             cost : locals.cost[i],
             quantity : locals.quantity[i]
           }
         }
         var item = new Item({
           title: req.body.title,
           state : req.body.state,
           chef: userChef._id,
           description: req.body.description,
           type: req.body.type,
           category: itemCategory._id
         });
         item.attributes = attributes;
         item.save(function (err, items) {
             if (err) return err
         });
        res.redirect('/itemList');
      })
     })
   }
 };

 exports.deleteItem = function(req,res){
   Item.findById(req.params.id).exec(function(err, item){
     if(err) return err;
     item.remove();
     res.redirect('/itemList');
   });
 };

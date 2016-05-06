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
   Item.find()
   .populate('category')
   .populate('chef')
   .exec(function(err, items){
      res.render('itemList' , {items: items } );
    })
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
             if (item)
               if (item.attributes.length == 0)
                var singleCost = true;
               else
                var singleCost = false;
             res.render('addItem', {
               item: item,
               userChef: userChef,
               itemCategories: itemCategories,
               itemCategory: itemCategory,
               paramsUserChef: paramsUserChef,
               singleCost : singleCost
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
       ItemCategory.findOne({name: req.body.category}).exec(function(err, itemCategory){
         User.findOne({email: req.body.chefEmail}).exec(function(err, userChef){
           if (err) return err;
           if(!itemCategory) res.end("The enetered category is not valid");
           if(!userChef) res.end("Chef does not exist");
           var locals = req.body;
           var totalCost = 0;
           item.title= req.body.title;
           item.state = req.body.state;
           item.chef= userChef._id;
           item.description= req.body.description;
           item.type= req.body.type;
           item.category= itemCategory._id;
           item.quantity = req.body.quantity;
           item.container = req.body.container;
           item.totalCost = 0;
           item.totalCost += totalCost;
           item.attributes = [];
           if (locals.nameAtt)
             for(var i=0; i<locals.nameAtt.length; i++){
               if (locals.nameAtt[i] != '' && locals.costAtt[i] != '')
                 item.attributes.push({
                   name : locals.nameAtt[i],
                   cost : locals.costAtt[i],
                   container: locals.containerAtt[i]
                 })
                 totalCost += Number(locals.costAtt[i]);
              }
           item.save(function (err, items) {
               if (err) return err
           });
          res.redirect('/itemList');
        })
       })
     });
   }else{
     ItemCategory.findOne({name: req.body.category}).exec(function(err, itemCategory){
       User.findOne({email: req.body.chefEmail}).exec(function(err, userChef){
         if (err) return err;
         if(!itemCategory) res.end("The enetered category is not valid");
         if(!userChef) res.end("Chef does not exist");
         var locals = req.body;
         var item = new Item({
           title: req.body.title,
           state : req.body.state,
           chef: userChef._id,
           description: req.body.description,
           type: req.body.type,
           quantity: req.body.quantity,
           category: itemCategory._id,
           container: req.body.container
         });
         var totalCost = 0;
         item.attributes = [];
         if (locals.nameAtt)
           for(var i=0; i<locals.nameAtt.length; i++){
             if (locals.nameAtt[i] != '' && locals.costAtt[i] != '') {
               item.attributes.push({
                 name : locals.nameAtt[i],
                 cost : locals.costAtt[i],
                 container: locals.containerAtt[i]
               })
               totalCost += Number(locals.costAtt[i]);
             }
           }
         if (locals.singleCost)
            totalCost += locals.singleCost;
         item.totalCost = 0;
         item.totalCost += totalCost;
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

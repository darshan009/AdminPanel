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
    res.json(itemCategories);
  });
};

exports.getAddItemCategory = function(req, res, next){
  if(req.params.id){
    ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
      res.json(itemCategory);
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
      res.json(items);
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
             res.json(
                item,
                userChef,
                itemCategories,
                itemCategory,
                paramsUserChef
             );
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
           var subItems = [];
           var totalCost = 0;
           item.subItems = [];
           for(var i=0; i<locals.name.length; i++){
             if (locals.cost[i] != ''){
               item.subItems.push({
                 name : locals.name[i],
                 cost : locals.cost[i],
                 quantity : locals.quantity[i],
                 container : locals.container[i]
               })
               totalCost += Number(item.subItems[i].cost);
             }
           }
           item.title= req.body.title;
           item.state = req.body.state;
           item.chef= userChef._id;
           item.description= req.body.description;
           item.type= req.body.type;
           item.category= itemCategory._id;
           item.totalCost = 0;
           item.totalCost += totalCost;
           item.attributes = [];
           for(var i=0; i<locals.nameAtt.length; i++){
             if (locals.nameAtt[i] != '' && locals.costAtt[i] != '')
               item.attributes.push({
                 name : locals.nameAtt[i],
                 cost : locals.costAtt[i]
               })
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
           category: itemCategory._id
         });
         item.subItems = [];
         var totalCost = 0;
         for(var i=0; i<locals.name.length; i++){
           if (locals.cost[i] != ''){
             item.subItems.push({
               name : locals.name[i],
               cost : locals.cost[i],
               quantity : locals.quantity[i],
               container : locals.container[i]
             })
             totalCost += item.subItems[i].cost;
           }
         }
         item.totalCost = 0;
         item.totalCost += totalCost;
         item.attributes = [];
         for(var i=0; i<locals.nameAtt.length; i++){
           if (locals.nameAtt[i] != '' && locals.costAtt[i] != '')
             item.attributes.push({
               name : locals.nameAtt[i],
               cost : locals.costAtt[i]
             })
          }
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

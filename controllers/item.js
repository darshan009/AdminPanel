var ItemCategory = require('../models/ItemCategory');
var Item = require('../models/Item.js');
var User = require('../models/User.js');

/*
 |-----------------------------------------------------------
 | Item CRUD operations
 |-----------------------------------------------------------
 */
 exports.getItemList = function(req, res){
   Item.find()
   .populate('category')
   .populate('chef')
   .exec(function(err, items){
     if (err) {
       return err;
     }
     res.render('itemList' , {items: items } );
    })
 };

 exports.getAddItem = function(req, res){
   Item.findById(req.params.id)
    .populate('chef')
    .populate('category')
    .exec()
    .then(function(item){
      if (item)
        if (item.attributes.length == 0)
         var singleCost = true;
        else
         var singleCost = false;
      return [item, singleCost];
    })
   .then(function(result){
     return User.find({type: 'Chef'}).exec()
      .then(function(chefs){
        result.push(chefs);
        return result;
      })
   })
   .then(function(result){
     return ItemCategory.find().exec()
      .then(function(itemCategories){
        result.push(itemCategories);
        return result;
      })
   })
   .then(function(result){
     res.render('addItem', {
       item: result[0],
       singleCost : result[1],
       userChef: result[2],
       itemCategories: result[3]
     });
   })
   .then(undefined, function(error){
     console.log(error);
   })
 };

 exports.postAddItem = function(req, res){
   if(req.params.id){
     Item.findById(req.params.id).exec(function(err, item){
       if (err)
        return err;
       var locals = req.body;
       var totalCost = 0;
       item.title= req.body.title;
       item.state = req.body.state;
       item.chef= req.body.chef;
       item.description= req.body.description;
       item.type= req.body.type;
       item.category= req.body.category;
       item.quantity = req.body.quantity;
       item.container = req.body.container;
       item.totalCost = 0;
       item.totalCost += totalCost;
       item.attributes = [];

       //if item has attributes
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
       item.save(function (err) {
           if (err)
            return err;
       });
      res.redirect('/itemList');
     });
   }else{
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

     //if item has attributes
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

     //if item does not have attributes then it has only one cost
     if (locals.singleCost)
        totalCost += locals.singleCost;
     item.totalCost = 0;
     item.totalCost += totalCost;
     item.save(function (err) {
       if (err)
        return err;
     });
    res.redirect('/itemList');
   }
 };

 exports.deleteItem = function(req, res){
   Item.findById(req.params.id).exec(function(err, item){
     if(err)
      return err;
     item.remove();
     res.redirect('/itemList');
   });
 };

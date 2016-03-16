var ItemCategory = require('../models/ItemCategory');


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
  }else{
    var itemCategory = new ItemCategory({
      name: req.body.name
    });
    itemCategory.save(function (err) {
        if (err) return err
    res.redirect('/categoryList');
    })
  }
};

exports.deleteItemCategory = function(req,res){
  ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
    if(err) return err;
    itemCategory.remove();
    res.redirect('/categoryList');
  });
};

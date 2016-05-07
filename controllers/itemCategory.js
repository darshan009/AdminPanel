var ItemCategory = require('../models/ItemCategory');

/*
 |-----------------------------------------------------------
 | Item category CRUD operations
 |-----------------------------------------------------------
 */
exports.getItemCategories = function(req, res){
  ItemCategory.find().exec(function(err, itemCategories){
    if (err) {
      return err;
    }
    res.render('categoryList', {itemCategories: itemCategories});
  });
};

exports.getAddItemCategory = function(req, res){
  if(req.params.id){
    ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
      if (err) {
        return err;
      }
      res.render('addCategory', {itemCategory: itemCategory});
    });
  }else
    res.render('addCategory');
};

exports.postAddItemCategory = function(req, res){
  if(req.params.id){
    ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
      if (err) {
        return err;
      }
      itemCategory.name = req.body.name;
      itemCategory.save(function (err) {
        if (err)
          return err;
      });
      res.redirect('/categoryList');
    });
  }
  else {
    var itemCategory = new ItemCategory({
      name: req.body.name
    });
    itemCategory.save(function (err) {
      if (err)
        return err;
    })
    res.redirect('/categoryList');
  }
};

exports.deleteItemCategory = function(req, res){
  ItemCategory.findById(req.params.id).exec(function(err, itemCategory){
    if (err) {
      return err;
    }
    itemCategory.remove();
    res.redirect('/categoryList');
  });
};

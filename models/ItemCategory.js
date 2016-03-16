var mongoose = require('mongoose');

var itemCategory = new mongoose.Schema({
  name: {type: String}
});

module.exports = mongoose.model('ItemCategory', itemCategory)

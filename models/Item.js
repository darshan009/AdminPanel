var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  title: { type: String },
  state: { type: String, enum: ['Draft', 'Published', 'Archieved'], default: 'Draft'},
  type: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory' },
  attributes: [{
     "name" : { type: String, default: '' },
     "quantity" : {type: Number, default: '1'},
     "cost" : { type: Number, default: '' },
     "container": { type: Number , default: '1'}
  }],
  image: String,
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Item', itemSchema);

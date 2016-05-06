var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  title: { type: String },
  state: { type: String, enum: ['Draft', 'Published', 'Archieved'], default: 'Draft'},
  type: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory' },
  attributes : [{
    "name" : String,
    "cost": Number,
    "container": Number
  }],
  quantity: Number,
  image: String,
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  container: Number,
  totalCost : Number
});

module.exports = mongoose.model('Item', itemSchema);

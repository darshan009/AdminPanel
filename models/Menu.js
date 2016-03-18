var mongoose = require('mongoose');

var menuSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  date: Date,
  meal: { type: String, enum: ['Lunch', 'Dinner'], default: 'Lunch'},
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  category: { type: String}
});

module.exports = mongoose.model('Menu', menuSchema);

var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  date: Date,
  meal: { type: String, enum: ['Lunch', 'Dinner'], default: 'Lunch'},
  category: { type: String},
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }
});

module.exports = mongoose.model('Order', orderSchema);

 var mongoose = require('mongoose');

var menuSchema = new mongoose.Schema({
  date: Date,
  meal: { type: String, enum: ['Lunch', 'Dinner'], default: 'Lunch'},
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  category: { type: String},
  subItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
    //  "name": { type: String },
    //  "quantity": {type: Number, default: '1'},
    //  "cost": { type: Number, default: '' },
    //  "container": { type: Number , default: '1'}
  ],
  totalCost: Number
});

module.exports = mongoose.model('Menu', menuSchema);

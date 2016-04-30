var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  state: { type: String, enum: ['Published', 'Archieved'], default: 'Published'},
  status : {type: String, enum: ['out', 'in', 'init'], default: 'init'},
  user: { type: String, ref: 'User' },
  date: Date,
  meal: { type: String, enum: ['Lunch', 'Dinner'], default: 'Lunch'},
  menu: [{
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    subItems: {
       _id : { type: mongoose.Schema.Types.ObjectId, ref: 'SubItems' }
    },
    attributes : {
      "name" : String,
      "quantity" : Number,
      "cost" : Number
    },
    specialInstruction: String,
    containerType: String,
    subTotal: Number,
    singleQuantity: { type: Number, default : '1' }
  }],
  address: {
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }
  },
  grandTotal : Number
});

module.exports = mongoose.model('Order', orderSchema);

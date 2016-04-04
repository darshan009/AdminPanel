var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  state: { type: String, enum: ['Published', 'Archieved'], default: 'Published'},
  user: { type: String, ref: 'User' },
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
    subTotal: Number,
    singleQuantity: { type: Number, default : '1' }
  }],
  address: {
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }
  },
  grandTotal : Number
});

module.exports = mongoose.model('Order', orderSchema);

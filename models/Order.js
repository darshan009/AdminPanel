var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  state: { type: String, enum: ['Published', 'Archieved'], default: 'Published'},
  user: { type: String, ref: 'User' },
  menu: [{
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    subItems: [{
       "name" : { type: String },
       "quantity" : {type: Number, default: '1'},
       "container": { type: Number , default: '1'}
    }],
    attributes : {
      "name" : String,
      "quantity" : Number
    }
  }],
  address: {
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }
  },
  grandTotal : Number
});

module.exports = mongoose.model('Order', orderSchema);

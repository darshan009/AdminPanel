var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  menu: [{
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }
  }],
  address: {
    tag : String,
    flatNo : String,
    streetAddress : String,
    landmark : String,
    pincode : Number,
    contactNo : Number
  }
});

module.exports = mongoose.model('Order', orderSchema);

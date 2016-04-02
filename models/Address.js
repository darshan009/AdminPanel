var mongoose = require('mongoose');

var addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tag : String,
  flatNo : String,
  streetAddress : String,
  landmark : String,
  pincode : Number
});

module.exports = mongoose.model('Address', addressSchema);

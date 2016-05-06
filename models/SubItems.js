var mongoose = require('mongoose');

var subItemsSchema = new mongoose.Schema({
  order : {
    _id : { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  },
  subItemsArray: [{
     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
     //name : String,
     quantity : Number,
     container: Number
  }],
  subTotal : Number
});

module.exports = mongoose.model('SubItems', subItemsSchema);

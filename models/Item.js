var mongoose = require('mongoose');

var menuSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  type: { type: String, default: 'Veg' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  portions: [{
     "value" : { type: String, default: '' },
     "cost" : { type: Number, default: '' },
     "container": { type: Number, default: 5 },
  }],
  date: Date,
  facebook: String,
  google: String,
  linkedin: String,
  twitter: String,
  image: String,
  chef: {
    name: { type: String, default: '' },
    image: { type: String, default: '' }
  }
});

module.exports = mongoose.model('Menu', menuSchema);

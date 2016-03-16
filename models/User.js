var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  phone: String,
  type: { type: Boolean, options: ['admin','general'], default: 'general'},
  amount: {type:Number, default: 0}
});

module.exports = mongoose.model('User', userSchema);

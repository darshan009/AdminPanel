var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  type: { type: String, options: ['admin','general'], default: 'general'},
  amount: String
});

module.exports = mongoose.model('User', userSchema);

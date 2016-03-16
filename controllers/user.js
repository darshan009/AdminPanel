var passport = require('passport');
var User = require('../models/User');

//check if user is logged in
exports.isAdmin = function(req, res, next){
  if(req.user && req.user.type == "admin")
    next();
  else
    res.redirect('/');
};
//login logout signup
exports.getLogin = function(req, res, next){
  if(req.user)
    if (user.type == "admin")
      res.render('/userList');
  res.render('adminLogin');
};
exports.postLogin = function(req, res, next){
    passport.authenticate('local', function(err, user, info){
      if (err)
        return next(err);
      if(!user)
        res.redirect('/');
      req.logIn(user,function(err){
        if(err)
          return next(err);
        res.redirect('/userList');
      });
    })(req, res, next);
};

//get all users
exports.getUsers = function(req, res, next){
  User.find().exec(function(err, users){
    if(err) return next(err);
    res.render('userList', {users: users});
  });
};
exports.getAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id).exec(function(err, user){
      if(err) return next(err);
      var locals = req.body;
      locals.data = user;
      res.render('addUser', {user: user});
    });
  }else res.render('addUser');
};

exports.postAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id).exec(function(err, user){
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.amount = req.body.amount;
        user.save(function (err) {
            if (err) return err
        });
        res.redirect('/userList');
    });
  }else{
    var user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      amount: req.body.amount
    });
    user.save();
    res.redirect('/userList');
  }
};

exports.getLogout = function(req, res, next){
  req.logout();
  res.redirect('/');
};

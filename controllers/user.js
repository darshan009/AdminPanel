var passport = require('passport');
var User = require('../models/User');

//check if user is logged in
exports.isLogged = function(req, res, next){
  var user = 1;
  if(user)
  {
    next();
  }
  else
    res.render('login');
};
//login logout signup
exports.getLogin = function(req, res, next){
  res.render('user');
};
exports.postLogin = function(req, res, next){
    passport.authenticate('local', function(err, user, info){
      if (err)
        return next(err);
      console.log(user);
      if(!user)
      {
        console.log("user to login");
        res.redirect('/login',{message: info.message});
      }
      req.logIn(user,function(err){
        if(err)
          return next(err);
        console.log("Login Sucessful")
        res.redirect('/');
      });
    })(req, res, next);
};

exports.getSignUp = function(req, res, next){
  res.render('signup');
};
exports.postSignUp = function(req, res, next){
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      siteAdmin: req.body.admin
    });
  user.save();
  res.redirect('/');
};

exports.getLogout = function(req, res, next){
  req.logout();
  res.redirect('/');
};

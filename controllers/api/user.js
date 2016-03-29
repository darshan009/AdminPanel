var passport = require('passport');
var User = require('../models/User');

//check if user is admin
exports.isAdmin = function(req, res, next){
  if(req.user){
    if((req.user.type).toLowerCase() == "admin")
      next();
    else res.end("Your not authorized");
  }
  else
    res.redirect('/');
};
//login logout signup
exports.getLogin = function(req, res, next){
  if(req.user){
    if((req.user.type).toLowerCase() == "admin")
      res.redirect('/userList');
    else
      res.end("Your are not authorized");
  }else res.render('adminLogin');
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
    res.json(users);
  });
};
exports.getAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id).exec(function(err, user){
      if(err) return next(err);
      var addressList = []
      addressList = (user.address);
      res.json(user, addressList);
    });
  }else res.render('addUser');
};

exports.postAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id).exec(function(err, user){
        if (err)
          return next(err);
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.type = req.body.userType;
        user.image = req.body.image;
        var newAmount = Number(user.amount) + Number(req.body.amount);
        user.amount = newAmount;
        user.address = [];
        var fullAddress = [];
        for (var i=0; i<req.body.streetAddress.length; i++)
          fullAddress[i] = {
            tag : req.body.tag[i],
            flatNo : req.body.flatNo[i],
            streetAddress : req.body.streetAddress[i],
            landmark : req.body.landmark[i],
            pincode : req.body.pincode[i]
          }
        console.log(fullAddress);
        user.address = fullAddress;
        console.log(user.address);
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
      type: req.body.userType,
      amount: req.body.amount,
      contactNo : req.body.contactNo
    });
    user.address = [];
    var fullAddress = [];
    for (var i=0; i<req.body.streetAddress.length; i++)
      fullAddress[i] = {
        tag : req.body.tag[i],
        flatNo : req.body.flatNo[i],
        streetAddress : req.body.streetAddress[i],
        landmark : req.body.landmark[i],
        pincode : req.body.pincode[i]
      }
    console.log(fullAddress);
    user.address = fullAddress;
    console.log(user.address);
    user.save(function (err) {
        if (err) return err
    });
    res.redirect('/userList');
  }
};

exports.getLogout = function(req, res, next){
  req.logout();
  res.redirect('/');
};

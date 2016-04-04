var passport = require('passport');
var User = require('../models/User');
var Address = require('../models/Address');

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
    res.render('userList', {users: users});
  });
};
exports.getAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id)
    .populate('address._id')
    .exec(function(err, user){
      if(err) return next(err);
      var addressList = []
      addressList = (user.address);
      console.log(user.address);
      res.render('addUser', {user : user, addressList : addressList});
    });
  }else res.render('addUser');
};

exports.postAddUser = function(req, res, next){
  if(req.params.id){
    User.findById(req.params.id)
    .populate('address._id')
    .exec(function(err, user){
      var addressFind = [];
      for (var i=0; i<user.address.length; i++)
         addressFind.push(user.address[i]._id);
      Address.find({_id : {$in : addressFind}})
      .exec(function(err, addresses){
        console.log(addresses);
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.type = req.body.userType;
        user.image = req.body.image;
        var newAmount = Number(user.amount) + Number(req.body.amount);
        user.amount = newAmount;
        var fullAddress = [];
        console.log("-------preaddressId-------");
        console.log(req.body.preaddressId);
        // for pre added addresses
        if (req.body.preaddressId)
          for (var i=0; i<req.body.preaddressId.length; i++) {
            var preaddressId = req.body.preaddressId[i];
            Address.update(
              { _id: preaddressId },
              {
                tag : req.body.pretag[i],
                flatNo : req.body.preflatNo[i],
                streetAddress : req.body.prestreetAddress[i],
                landmark : req.body.prelandmark[i],
                pincode : req.body.prepincode[i]
              },
              { upsert : true }
            ).exec(function(err, address){
              console.log(address);
            });
          }
        // removing address ID from user.address if removed
        var found = false;
        for (var i=0; i<user.address.length; i++) {
          for (var j=0; j<req.body.preaddressId.length; j++)
            if ( user.address[i]._id == req.body.preaddressId[j])
              found = true;
          if (!found)
            //user.address[i]._id.pull();
          found = false;
        }
        // for newly added addresses
        if (req.body.streetAddress)
          for (var i=0; i<req.body.streetAddress.length; i++) {
            var address = new Address({
              user : user._id,
              tag : req.body.tag[i],
              flatNo : req.body.flatNo[i],
              streetAddress : req.body.streetAddress[i],
              landmark : req.body.landmark[i],
              pincode : req.body.pincode[i]
            });
            user.address.push(address._id);
            address.save(function (err) {
                if (err) return err
            });
          }
        //console.log(user.address);
        user.save(function (err) {
            if (err) return err
        });
        res.redirect('/userList');
      })
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
    for (var i=0; i<req.body.streetAddress.length; i++) {
      var address = new Address({
        user : user._id,
        tag : req.body.tag[i],
        flatNo : req.body.flatNo[i],
        streetAddress : req.body.streetAddress[i],
        landmark : req.body.landmark[i],
        pincode : req.body.pincode[i]
      });
      user.address.push(address._id);
      address.save(function (err) {
          if (err) return err
      });
    }
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

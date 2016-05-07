var passport = require('passport');
var User = require('../models/User');
var Order = require('../models/Order');
var Item = require('../models/Item');
var Address = require('../models/Address');

/*
 |-----------------------------------------------------------
 | grant access on basis of user type
 |-----------------------------------------------------------
*/
exports.isAdmin = function(req, res, next){
  if(req.user){
    if((req.user.type).toLowerCase() == "admin")
      next();
    else if ((req.user.type).toLowerCase() == "staff") {
      if (req.originalUrl == "/assembly" || req.originalUrl == "/mixedAssembly" || req.originalUrl == "/multipleAssembly")
        next();
      else
        res.redirect('/assembly');
    }else if ((req.user.type).toLowerCase() == "chef") {
      if (req.originalUrl == "/itemList" || req.originalUrl == "/addItem" || req.originalUrl == "/menuList" || req.originalUrl == "/addMenu")
        next();
      else
        res.redirect('/itemList');
    }
    else res.end("Your not authorized");
  }
  else
    res.redirect('/');
};


/*
 |-----------------------------------------------------------
 | LOGIN LOGOUT
 |-----------------------------------------------------------
*/
exports.getLogin = function(req, res){
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

exports.getLogout = function(req, res){
  req.logout();
  res.redirect('/');
};


/*
 |-----------------------------------------------------------
 | User CRUD operations
 |-----------------------------------------------------------
*/
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
      if(err)
        return next(err);
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
      if(err)
        return next(err);
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.type = req.body.userType;
      user.image = req.body.image;
      var newAmount = Number(user.amount) + Number(req.body.amount);
      user.amount = newAmount;

      console.log("-------preaddressId-------");
      console.log(req.body.preaddressId);

      // remove address from user.address if address is removed
      var found = false;
      if (req.body.preaddressId && req.body.preaddressId.length != user.address.length){
        for (var i=0; i<user.address.length; i++) {
          for (var j=0; j<req.body.preaddressId.length; j++)
            if ( user.address[i]._id == req.body.preaddressId[j]) {
              found = true;
              break;
            }
          if (!found) {
            var addressId = user.address[i]._id;
            Address.remove({_id : addressId}, function(err){
              if (err) return err;
              console.log("address removed");
            });
            user.address.splice(i, 1);
          }
          found = false;
        }
      }

      // update previously added addresses
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
      user.save(function (err) {
          if (err)
            return err;
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
    console.log(user.address);
    user.save(function (err) {
        if (err)
          return err;
    });
    res.redirect('/userList');
  }
};


/*
 |-----------------------------------------------------------
 | User history section --> orders && transactions
 |-----------------------------------------------------------
*/
exports.getUsersForHistory = function(req, res, next){
  User.find().exec(function(err, users){
    if(err)
      return next(err);
    res.render('userListHistory', {users: users});
  });
};
exports.getUserHistory = function(req, res, next){
  Order.find({user: req.params.email})
  .populate('menu._id')
  .exec(function(err, orders) {
    if(err)
      return next(err);
    var fullResult = [], y = 0;
    for (var i=0; i<orders.length; i++) {
      for (var j=0; j<orders[i].menu.length; j++) {
        fullResult[y] = {
            title : orders[i].menu[j]._id.title,
            date : orders[i].date,
            user : orders[i].user,
            quantity : orders[i].menu[j].singleQuantity,
            mealType : orders[i].meal,
            details : []
        }
        if (orders[i].menu[j].attributes.name) {
          fullResult[y].nameAtt = orders[i].menu[j].attributes.name;
          fullResult[y].quantityAtt = orders[i].menu[j].singleQuantity;
        }
        y++;
      }
    }
    res.render('orderHistory', {fullResult: fullResult});
  });
};

/*
 |-----------------------------------------------------------
 | AJAX call to get users address in add Order
 | GET /getUserAddress
 |-----------------------------------------------------------
*/
exports.getUserAddress = function(req, res){
  if(req.query.userEmail)
    var userEmail = req.query.userEmail;
  User.findOne({email: userEmail})
  .populate('address._id')
  .exec(function(err, user){
    if (err) {
      return err;
    }
    var userJson = [];
    if (user.address)
      for(var i=0; i<user.address.length; i++)
        userJson[i] = {
          address : user.address[i]._id.tag,
          flatNo : user.address[i]._id.flatNo,
          streetAddress : user.address[i]._id.streetAddress,
          landmark : user.address[i]._id.landmark,
          pincode : user.address[i]._id.pincode,
          contactNo : user.contactNo
        }
    // still not sure why I used it;
    // if (userJson.length == 0)
    //   userJson[0] = {
    //     amount: 0
    //   }
    // else
    userJson[0].amount = user.amount;
    res.send(userJson);
  })
};

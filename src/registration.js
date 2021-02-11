var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var faker = require('faker');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var bcrypt = require("bcrypt");
var con = require("../config/connection");

con.connect(function (err) {
  if (err) {
    console.log("Unable to connect to the database");
  } else {
    console.log("Connection to the database successful");
  }
});

  function generateUsers() {
      let users = []
      for (let id=1; id <= 500; id++) {
        let firstName = faker.name.firstName();
        let lastName = faker.name.lastName();
        let email = faker.internet.email();
        let username = firstName;
        let password = "$2b$15$O92B0OfLYZhq1UAotcmHdejQv2mUJYbd/sH.1839PCNfmDH5ZQMQ6" //Pass1234@
        let verifkey = faker.random.number({
          'min': 1000,
          'max': 5000
        });
        let verified = 1;
        let setup = 1;

        let genders = [ 'female' , 'male', 'bisexual' ];
        let gender = faker.random.arrayElement(genders);
        let pref_gender = faker.random.arrayElement(genders);
        let age = faker.random.number({
          'min': 18,
          'max': 70
        });
        let interests = [ '#Fitness' , '#loving', '#caring', '#sweet', '#cars', '#movies', '#sunsets' ,'#art', '#photography', '#fashion', '#coding' ];
        let tags = faker.random.arrayElement(interests);
        let bio = faker.lorem.sentence(5);
        let latitude =  faker.address.latitude();
        let longitude = faker.address.longitude();
        let city = faker.address.city();
        let country = faker.address.country();
        
        let pic = faker.image.avatar();

        sql = "INSERT INTO user (name, surname, username, email, password, verifkey, verified, setup) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql, [firstName, lastName, username, email, password, verifkey, verified, setup],function (err, result) {
          if (err) throw err;
        });

        sql = "INSERT INTO user_profile (gender, pref_gender, bio, age, username, latitude, longitude, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql, [gender, pref_gender, bio, age, username, latitude, longitude, city, country],function (err, result) {
          if (err) throw err;
        });

        sql = "INSERT INTO images (image_path, username, profile_pic) VALUES (?, ?, ?)";
        con.query(sql, [pic, username, "1"],function (err, result) {
          if (err) throw err;
        });

        sql = "INSERT INTO interests (interests, username) VALUES (?, ?)";
        con.query(sql, [tags, username],function (err, result) {
          if (err) throw err;
        });

        sql = "INSERT INTO user_filter (username, name, surname, gender, pref_gender, bio, age, image_path, profile_pic, likes, latitude, longitude, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql, [username, firstName, lastName, gender, pref_gender, bio, age, pic, 1, 0, latitude, longitude, city, country],function (err, result) {
          if (err) throw err;
        });
      }

  }
    generateUsers();
    console.log('500 records inserted!');
     //console.log('faker commented out for now');


router.get("/", function (req, res) {
  res.render("registration", {msg: null});
});

router.post("/", urlencodedParser, function (req, res) {
  var name = req.body.name;
  var surname = req.body.surname;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var conf_password = req.body.conf_password;
  var key = Math.floor(Math.random() * 90000) + 10000;

  if (!name || !surname || !username || !email || !password || !conf_password) {
    console.log("all fields must be completed");
    res.render("registration", {msg: "fileds missing"});
    return;
  }

  if (
    !req.body.email.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    console.log("The format of the email address is incorrect");
    res.render("registration", {msg: "The format of the email address is incorrect"});
    return;
  }

  if (!req.body.password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")) {
    console.log(
      "Password must be atleast 8 characters long containing an uppercase character, lowecase character a special character and a number "
    );
    res.render("registration", {msg: "Password must be atleast 8 characters long containing an uppercase character, lowecase character a special character and a number "});
    return;
  }

  if (req.body.password !== req.body.conf_password) {
    console.log("Passswords do not match");
    res.render("registration", {msg: "Passwords do not match"});
    return;
  } else {
    var hashed_pass = bcrypt.hashSync(password, 15);
  }

  //check if username already exists.
  var sql =
    "SELECT count(*) as total FROM user WHERE username = ? OR email = ?";
  var query = con.query(sql, [username, email], function (err, result) {
    if (result[0].total >= 1) {
      console.log("username or email already in use");
      res.render("registration", {msg: "username or email already in use"});
      return;
    } else {
      var user_record = {
        name: name,
        surname: surname,
        username: username,
        email: email,
        password: hashed_pass,
        verifkey: key,
        verified: '0',
        setup: '0',
      };

      var profile_record = {
        gender: null,
        pref_gender: null,
        bio: null,
        age: null,
        username: username,
        latitude: null,
        longitude: null,
        city: null,
        country: null,
      };

      var user_filter = {
        username: username,
        name: name,
        surname: surname,
        gender: null,
        pref_gender: null,
        bio: null,
        age: null,
        image_path: null,
        profile_pic: 1,
        likes: 0,
        latitude: 0,
        longitude: 0,
        city: null,
        country: null,
        distance:null,
      };


      con.query("INSERT INTO user_profile SET?", profile_record, function (err, result) {
        if (err) {
          status = "Unable to create this user";  //set user profile to null intitially
          console.log(status);
          console.log(err);
        }
        })

        con.query("INSERT INTO user_filter SET?", user_filter, function (err, result) {
          if (err) {
            status = "Unable to create this user";  //set user filter to null intitially
            console.log(status);
            console.log(err);
          }
          })

      con.query("INSERT INTO user SET?", user_record, function (err, result) {
        if (err) {
          status = "Unable to create this user";
          console.log(status);
          console.log(err);
          res.render("registration", {msg: "unabel to create this user"});
        } else {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'wtcmatcha2020@gmail.com',
                  pass: 'Matcha123'
                },
                tls: { rejectUnauthorized: false }
              });

              
              
              var mailOptions = {
                from: 'wtcmatcha2020@gmail.com',
                to: email,
                subject: 'Matcha email verification',
                html: '<html><body><div align=center> \
                CLICK ON THE FOLLOWING LINK TO VALIDATE YOUR ACCOUNT: <BR />\
                <a href="http://localhost:3000/confirm?user='+username +'&key='+key +'">Confirm your Account</a> \
                </div></body></html>'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  console.log("plese check your email");
                }
              });  

          res.render("login", {msg: "please check your emails to verify your account"});
        }
      });
    }
  });
});

module.exports = router;

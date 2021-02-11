var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var con = require("../config/connection");

// con.connect(function (err) {
//   if (err) {
//     console.log("Unable to connect to the database");
//   } else {
//     console.log("Connection to the database successful");
//   }
// });

router.get("/", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  if (!req.session.user) {
    res.render("login", { msg: "Please log in" });
  } else {
    if(!req.session.profile)
    res.redirect("/setProfile")
    else{
    con.query("SELECT * FROM user WHERE username = ?", [req.session.user], function (err, user) {
        if (err) throw err;
        con.query("SELECT * FROM user_profile WHERE username = ?", [req.session.user], function (err, userProfile) {
          if (err) throw err;
            con.query("SELECT * FROM `images` WHERE `username` = ?", req.session.user, function (err, images, fields) {
              if (err) throw err;
                con.query("SELECT * FROM `images` WHERE `username` = ? AND  `profile_pic` = 1", req.session.user, function (err, profile_picture, fields) {
                    if (err) throw err;
                    con.query("SELECT * FROM `interests` WHERE `username` = ?", req.session.user, function (err, tags, fields) {
                        if (err) throw err;
                        if (!req.session.profile) {
                          res.render("set_profile", {username: req.session.user, photos: result});
                        } else{
                          if(!profile_picture.length){
                            res.render("profile", {
                              username: req.session.user, 
                              name: user[0].name, 
                              surname: user[0].surname, 
                              email: user[0].email, 
                              photos: images, 
                              profile_picture: "https://az-pe.com/wp-content/uploads/2018/05/kemptons-blank-profile-picture.jpg", 
                              tags: tags,
                              age: userProfile[0].age,
                              gender: userProfile[0].gender,
                              pref_gender: userProfile[0].pref_gender,
                              bio: userProfile[0].bio,
                            });
                          }else{
                            res.render("profile", {
                              username: req.session.user, 
                              name: user[0].name, 
                              surname: user[0].surname, 
                              email: user[0].email, 
                              photos: images, 
                              profile_picture: profile_picture[0].image_path, 
                              tags: tags,
                              age: userProfile[0].age,
                              gender: userProfile[0].gender,
                              pref_gender: userProfile[0].pref_gender,
                              bio: userProfile[0].bio,
                            });
                          }
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
    }
  }
});

module.exports = router;

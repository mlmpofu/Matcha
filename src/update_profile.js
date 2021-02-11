var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
var bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");

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
      con.query("SELECT * FROM `user` WHERE `username` = ?", req.session.user, function (err, user, fields) {
        if (err) throw err;
      con.query("SELECT * FROM `user_profile` WHERE `username` = ?", req.session.user, function (err, userProfile, fields) {
        if (err) throw err;
      con.query("SELECT * FROM `images` WHERE `username` = ?", req.session.user, function (err, result, fields) {
        if (err) throw err;
        con.query("SELECT * FROM `images` WHERE `username` = ? AND  `profile_pic` = 1", req.session.user, function (err, profile_picture, fields) {
            if (err) throw err;
            con.query("SELECT * FROM `interests` WHERE `username` = ?", req.session.user, function(err, tags, fields){
              if (err) throw err;
                if (profile_picture.length && tags.length && userProfile[0].gender) {
                    res.render("update_profile", {username: req.session.user, photos: result, profile_picture: profile_picture[0].image_path, tags: tags, msg: null, name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }else if(!profile_picture.length && tags.length && userProfile[0].gender){
                    res.render("update_profile", {username: req.session.user, photos: result, profile_picture: "https://az-pe.com/wp-content/uploads/2018/05/kemptons-blank-profile-picture.jpg",tags: tags, msg: "you need to add a profile pic", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }else if(profile_picture.length && !tags.length && userProfile[0].gender){
                    res.render("update_profile", {username: req.session.user, photos: result, profile_picture: profile_picture[0].image_path,tags: null, msg: "you need to add atleast 1 interest", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }else if(profile_picture.length && tags.length && !userProfile[0].gender){
                    res.render("update_profile", {username: req.session.user, photos: result, profile_picture: profile_picture[0].image_path,tags: tags, msg: "You need to complete the user profile", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }else if(!profile_picture.length && tags.length && !userProfile[0].gender){
                  res.render("update_profile", {username: req.session.user, photos: result, profile_picture: "https://az-pe.com/wp-content/uploads/2018/05/kemptons-blank-profile-picture.jpg",tags: tags, msg: "you need to add a profile pic and complete your user profile", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }else if(profile_picture.length && !tags.length && !userProfile[0].gender){
                  res.render("update_profile", {username: req.session.user, photos: result, profile_picture: profile_picture[0].image_path,tags: null, msg: "you need to add atleast 1 interest aswell as complete the user profile", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                }
                else{
                    res.render("update_profile", {username: req.session.user, photos: result, profile_picture: "https://az-pe.com/wp-content/uploads/2018/05/kemptons-blank-profile-picture.jpg",tags: null, msg: "you need to add a profile pic as well as atleast 1 interest and complete the user profile", name: user[0].name, surname: user[0].surname, email: user[0].email, username: user[0].username, errMsg: req.session.Msg});
                  }
                })   
              }
            );
          }
        );
      })
    })
    }
  }
  });

router.post("/name", urlencodedParser, function (req, res) {
  var name = req.body.name;

  con.query("SELECT * FROM `images` WHERE `username` = ?", req.session.user, function (err, images, fields) {
    if (err) throw err;
    con.query("SELECT * FROM `images` WHERE `username` = ? AND  `profile_pic` = 1", req.session.user, function (err, profile_pic, fields) {
        if (err) throw err;
        con.query("SELECT * FROM `interests` WHERE `username` = ?", req.session.user, function(err, tags, fields){
          if (err) throw err;

          con.query(
            "UPDATE user SET `name` = ? Where  `username` = ?",
            [name, req.session.user],
            function (err, result) {
              if (err) {
                status = "Unable to update name";
                console.log(status);
                console.log(err);
                res.redirect("/updateProfile");
              } else {
                console.log("name updated");
                con.query("UPDATE user_filter SET name = ? WHERE username = ?", [name, req.session.user], function (err, result) {
                  if (err) {
                    console.log(err);
                  }
                  });
                res.redirect("/updateProfile");
              }
            }
          );
        });
      });
    });
});

router.post("/surname", urlencodedParser, function (req, res) {
  var surname = req.body.surname;

  con.query(
    "UPDATE user SET `surname` = ? Where  `username` = ?",[surname, req.session.user],
    function (err, result) {
      if (err) {
        status = "Unable to update surname";
        console.log(status);
        console.log(err);
        res.redirect("/updateProfile");
      } else {
        console.log("surname updated");
        con.query("UPDATE user_filter SET surname = ? WHERE username = ?", [surname, req.session.user], function (err, result) {
          if (err) {
            console.log(err);
          }
          });
        res.redirect("/updateProfile");
      }
    }
  );
});

router.post("/username", urlencodedParser, function (req, res) {
  var username = req.body.username;
  //check if username already exists.
  var sql = "SELECT count(*) as total FROM user WHERE username = ?";
      var query = con.query(sql, username, function (err, result) {
      if (result[0].total >= 1) {
          console.log("username already in use");
          req.session.Msg = "username already in use";
          res.redirect("/updateProfile");
          return;
    } else {
         con.query("UPDATE user SET `username` = ? Where  `username` = ?", [username, req.session.user], function (err, result) {
              if (err) {
                  status = "Unable to update user name";
                  console.log(status);
                  console.log(err);
                  res.redirect("/updateProfile");
              } else {
                  console.log("username updated");
                  var old_username = req.session.user;
                  con.query("UPDATE user_profile SET username = ? WHERE username = ? ", [username, old_username], function (err, result) {
                    if (err){
                      console.log(err);
                      res.redirect("/updateProfile");
                    }
                  });

                  con.query("UPDATE images SET username = ? WHERE username = ? ", [username, old_username], function (err, result) {
                    if (err){
                      console.log(err);
                      res.redirect("/updateProfile");
                    }
                  });

                  con.query("UPDATE interests SET username = ? WHERE username = ? ", [username, old_username], function (err, result) {
                    if (err){
                      console.log(err);
                      res.redirect("/updateProfile");
                    }
                  });

                  con.query("UPDATE user_filter SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                    if (err) {
                      console.log(err);
                    }
                    });

                  con.query("UPDATE user_invite SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                      if (err) {
                        console.log(err);
                      }
                      });

                   con.query("UPDATE user_like SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                        if (err) {
                          console.log(err);
                        }
                        });

                  con.query("UPDATE user_report SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                      if (err) {
                        console.log(err);
                        }
                      });

                  con.query("UPDATE user_block SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                    if (err) {
                      console.log(err);
                    }
                    });

                    con.query("UPDATE messages SET username = ? WHERE username = ?", [username, old_username], function (err, result) {
                      if (err) {
                        console.log(err);
                      }
                      });
     
  

                    

                req.session.Msg = null;
                req.session.user = username;
                res.redirect("/updateProfile");   
              }
          });
      }
  });
});

router.post("/email", urlencodedParser, function (req, res) {
    var email = req.body.email;
    var username = req.session.user;

    if (!req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        console.log("The format of the email address is incorrect");
        req.session.Msg = "The format of the email address is incorrect";
        res.redirect("/updateProfile");
    }

    var sql = "SELECT count(*) as total FROM user WHERE email = ?";
        var query = con.query(sql, email, function (err, result) {
        if (result[0].total >= 1) {
            console.log("email already in use");
            req.session.Msg = "email already in use";
            res.redirect("/updateProfile");
            return;
      } else {
        var key = Math.floor(Math.random() * 90000) + 10000;
           con.query("UPDATE user SET `email` = ?, `verifkey` = ?, verified = 0 Where  `username` = ?", [email, key, req.session.user], function (err, result) {
                if (err) {
                    status = "Unable to update email";
                    console.log(status);
                    console.log(err);
                    res.redirect("/updateProfile");
                } else {
                    console.log("email updated");
                    req.session.Msg = null;

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
                        }
                      });  
                      req.session.destroy();
                    res.render("login", {msg: "please verify your new email address"});
                }
            });
        }
    });
  });

  router.post("/password", urlencodedParser, function (req, res) {
    var password = req.body.password;
    var conf_password = req.body.conf_password;


    if (!password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")) {
        console.log("Password must be atleast 8 characters long containing an uppercase character, lowecase character a special character and a number ");
        req.session.Msg = "Password must be atleast 8 characters long containing an uppercase character, lowecase character a special character and a number ";
        res.redirect("/updateProfile");
        return;
      }
    
      if (password !== conf_password) {
        console.log("Passswords do not match");
        req.session.Msg = "Passswords do not match";
        res.redirect("/updateProfile");
        return;
      } else {
        var hashed_pass = bcrypt.hashSync(password, 15);
        //console.log(hashed_pass);
        con.query(
            "UPDATE user SET `password` = ? Where  `username` = ?",[hashed_pass, req.session.user],
            function (err, result) {
              if (err) {
                status = "Unable to update password";
                console.log(status);
                console.log(err);
                res.redirect("/updateProfile");
              } else {
                console.log("password updated");
                req.session.Msg = "Passsword updated successfully";
                res.redirect("/updateProfile");
              }
            }
          );
      }
  });

router.post('/userProfile',urlencodedParser, function (req, res) {
    var gender = req.body.gender;
    var pref_gender = req.body.pref_gender;
    var bio = req.body.bio;
    var age = req.body.age;

    console.log(gender);
    console.log(pref_gender);
    console.log(bio);
    console.log(age);

    con.query("UPDATE user_profile SET gender = ?, pref_gender = ?, bio = ?, age = ? WHERE username = ?", [gender, pref_gender, bio, age, req.session.user], function (err, result) {
      if (err) {
        status = "Unable to submit data";
        console.log(status);
        console.log(err);
        res.redirect("/updateProfile");
      } else {
        console.log("data uploaded succesfully") ;
        req.session.Msg = "Profile updated successfully";

        con.query("UPDATE user_filter SET gender = ?, pref_gender = ?, bio = ?, age = ? WHERE username = ?", [gender, pref_gender, bio, age, req.session.user], function (err, result) {
          if (err) {
            console.log(err);
          }
        })
        res.redirect("/updateProfile");
      }
    });
  })

  router.post('/interests',urlencodedParser, function (req, res) {
    var interests = req.body.interests;
    if(interests.startsWith("#", 0)){
        interests = interests.replace(/\s+/g, '');
      }
      else{
        interests = "#" + interests;
        interests = interests.replace(/\s+/g, '');
      }
      

    var interests_record = {
      interests: interests,
      username: req.session.user
    };

    var sql ="SELECT count(*) as total FROM interests WHERE username = ?";
    con.query(sql, req.session.user, function (err, result) {
    if (result[0].total >= 6) {
      console.log("Max tag limit reached");
      req.session.Msg = "Max tag limit reached";
      res.redirect("/updateProfile");
      return;
    } else {
        con.query("INSERT INTO interests SET?", interests_record, function (err, result) {
            if (err) {
                status = "Unable to add interests";
                console.log(status);
                console.log(err);
                res.redirect("/updateProfile");
            }else{
                console.log("interest successfully added");
                req.session.Msg = null;
                res.redirect("/updateProfile");
            }
        })
        }
    })
});

  router.post('/profilePic',urlencodedParser, function (req, res) {
    var profilePic = req.body.profilePic;
    con.query("SELECT * FROM images WHERE username = ? AND profile_pic = 1", [req.session.user], function (err, result) {
      if (err) {
        console.log(err);
      }                                                             ////////////check the existing profile pic and set to 0 and the set new one to 1/////////////////
      else {
        if(result.length){
          var pic_id = result[0].img_id;
          con.query("UPDATE images SET profile_pic = '0' WHERE username = ? AND img_id = ?", [req.session.user, pic_id], function (err, result) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    })

    con.query("UPDATE images SET profile_pic = '1' WHERE username = ? AND img_id = ?", [req.session.user, profilePic], function (err, result) {
      if (err) {
        console.log(err);
        res.redirect("/updateProfile");
      } else { 
        req.session.Msg = null;
        console.log("Profile Pic updated succesfully");
        con.query("SELECT image_path FROM images WHERE username = ? AND profile_pic = ?", [req.session.user, 1], function (err, proPic) {
          if (err) {
            console.log(err);
          }
          
          if(proPic.length){
            con.query("UPDATE user_filter SET image_path = ? WHERE username = ? ", [proPic[0].image_path, req.session.user], function (err, result) {
            if (err) {
              console.log(err);
            }
            });
          }
        });
        res.redirect("/updateProfile");
      }
    })
    
  });

router.post('/delete',urlencodedParser, function (req, res) {
    var picId = req.body.deletebtn;
    var user = req.session.user;
    con.query("SELECT count(*) as total FROM images WHERE username = ?", [req.session.user], function (err, images) {
        if (err) throw err;
        if(images[0].total > 1)
        {
            con.query("DELETE from `images` WHERE username = ? AND img_id = ?", [user, picId], function (err, result) {
                if (err) {
                  console.log(err);
                  res.redirect("/updateProfile");
                } else {
                  req.session.Msg = null;
                  console.log(" Pic deleted succesfully");
                  res.redirect("/updateProfile");
                }
              })
        }else{
            console.log("Minimum of 1 pic required");
            req.session.Msg = "Minimum of 1 pic required, please add another image before deleting this one";
            res.redirect("/updateProfile"); 
        }
    });
  });

  router.post('/deleteInterest',urlencodedParser, function (req, res) {
    var tagId = req.body.deleteTag;
    var user = req.session.user;
    con.query("SELECT count(*) as total FROM interests WHERE username = ?", [req.session.user], function (err, interests) {
        if (err) throw err;
        if(interests[0].total > 1)
        {
            con.query("DELETE from `interests` WHERE username = ? AND id = ?", [user, tagId], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect("/updateProfile");
            } else {
                console.log(" Tag deleted succesfully");
                res.redirect("/updateProfile");
            }
            })
        }else{
            console.log("Minimum of 1 interest required");
            req.session.Msg = "Minimum of 1 interest required, please add another tag before deleting this one";
            res.redirect("/updateProfile"); 
        }
    });
  });

module.exports = router;

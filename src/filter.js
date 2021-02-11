
var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const geolib = require('geolib');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var con = require("../config/connection");

router.get('/', (req, res)=>{
    if(!req.session.user){
        res.render("login",{msg: "Please log in"});
    }
    else{

        if(!req.session.profile)
    res.redirect("/setProfile")
    else{
    res.render("filter", {username: req.session.user, tag: null});
     con.query("DELETE FROM filter_tags", function (err, results, fields) {
            if (err) throw err;
        })

        con.query("DELETE FROM filter_locations", function (err, results, fields) {
            if (err) throw err;
        })
    }  
}  

});

router.post('/',urlencodedParser, (req, res)=>{
   var gender = req.body.pref_gender;
   var minage = req.body.minage;
   var maxage = req.body.maxage;
   var range = req.body.range;
   var rating = req.body.rate;
   var distance = req.body.range;
    distance = distance * 1000;
   ///////////////////////
   if(distance){
       con.query("SELECT latitude, longitude FROM user_filter WHERE username = ?", [req.session.user], function (err, myCo) {
        if (err) throw err;
      con.query("SELECT latitude, longitude, username FROM user_filter WHERE username != ?", [req.session.user], function (err, usersCo) {
        if (err) throw err;
    
        usersCo.forEach(function(row) {
            
            if(geolib.isPointWithinRadius(
                { latitude: row.latitude, longitude: row.longitude },
                { latitude: myCo[0].latitude, longitude: myCo[0].longitude },
                distance
            )){
                con.query("INSERT INTO filter_locations (username)  VALUES (?)", [row.username], function (err, myCo) {
                    if (err) throw err;
                })

            }
        });
    
    })
})

}


   //////////////////////////

   req.session.gender = gender;
   req.session.minage = minage;
   req.session.maxage = maxage;
   req.session.rating = rating;
   req.session.range = distance;
  con.query("SELECT COUNT (*) AS count FROM user", function (err, user_count) {
    if (err) throw err;
   con.query("SELECT count(*) as total FROM filter_tags", function (err, results, fields) {
    if (err) throw err;
    if(results[0].total == 0){
        if(!rating){
            if(gender == "bisexual"){
                con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, minage, maxage],function(err, usesNoTags, field){
                    if (err) throw err;
                    res.render("home", {userData: usesNoTags, user: req.session.user, user_count: user_count[0].count});
                })
            }else{
                con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `gender` = ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, gender, minage, maxage],function(err, usesNoTags, field){
                    if (err) throw err;  
                    res.render("home", {userData: usesNoTags, user: req.session.user, user_count: user_count[0].count});
                })
            }    
        }else{
                var ratingNo = Math.round(rating * 0.2 * user_count[0].count);

                if(gender == "bisexual"){
                    con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `age` BETWEEN ? AND ? AND likes >= ? AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, minage, maxage, ratingNo],function(err, usesNoTags, field){
                        if (err) throw err;
                        res.render("home", {userData: usesNoTags, user: req.session.user, user_count: user_count[0].count});
                    })
                }else{
                    con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `gender` = ? AND `age` BETWEEN ? AND ? AND likes >= ? AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, gender, minage, maxage, ratingNo],function(err, usesNoTags, field){
                        if (err) throw err;  
                        res.render("home", {userData: usesNoTags, user: req.session.user, user_count: user_count[0].count});
                    })
                }   
        }
       
    }else{////if there is tags
        if(!rating){
            if(gender == "bisexual"){
                con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `filter_tags`)) AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, minage, maxage], function (err, results, fields) {
                    if (err) throw err;
                    res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
                })
              }else{
                  con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `gender` = ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `filter_tags`)) AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, gender, minage, maxage], function (err, results, fields) {
                  if (err) throw err;
                      console.log("results");
                      console.log(results);
                  //render home with results
                  res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
              })
            }
        }else{
                var ratingNo = Math.round(rating * 0.2 * user_count[0].count);

                if(gender == "bisexual"){
                    con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `age` BETWEEN ? AND ? AND likes >= ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `filter_tags`)) AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, minage, maxage, ratingNo], function (err, results, fields) {
                        if (err) throw err;
                        res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
                    })
                  }else{
                      con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `gender` = ? AND `age` BETWEEN ? AND ? AND likes >= ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `filter_tags`)) AND `username` IN (SELECT `username` FROM `filter_locations`)", [req.session.user, gender, minage, maxage, ratingNo], function (err, results, fields) {
                      if (err) throw err;
                      res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
                  })
                }
        }
    }
   })
})
});

router.get('/:user', (req, res)=>{
    res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      if (!req.session.user) {
        res.render("login", { msg: "Please log in" });
      } else {
            var username = req.params.user;
            req.session.connect_invite = username;
            
            con.query("INSERT INTO views (viewer, viewed) values (?, ?)", [req.session.user, username], function (err, user_count) {
                if (err) throw err;
            })
          
    con.query("SELECT COUNT (*) AS count FROM user", function (err, user_count) {
        if (err) throw err;       
        con.query("SELECT COUNT (*) AS count FROM user_like WHERE requ_user = ?",[username] , function (err, likes) {
            if (err) throw err;
            con.query("SELECT * FROM user WHERE username = ?", [username], function (err, user) {
                if (err) throw err;
                con.query("SELECT * FROM user_profile WHERE username = ?", [username], function (err, userProfile) {
                    if (err) throw err;
                    con.query("SELECT * FROM `images` WHERE `username` = ?", username, function (err, images, fields) {
                        if (err) throw err;
                        con.query("SELECT * FROM `images` WHERE `username` = ? AND  `profile_pic` = 1", username, function (err, profile_picture, fields) {
                            if (err) throw err;
                            con.query("SELECT * FROM `interests` WHERE `username` = ?", username, function (err, tags, fields) {
                                if (err) throw err;
                               
                                    
                                    con.query("SELECT * FROM user_block WHERE (username = (?) AND requ_user = (?)) ", [req.session.connect_invite, req.session.user], function (err, result) {
                                        //console.log("the result :" + JSON.stringify(result));
                                    if (err || !result.length || !result[0].requ_user)
                                    {
                                        if(!profile_picture.length){
                                            res.render("usersProfile", {
                                            username: username, 
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
                                            likes: likes[0].count,
                                            users: user_count[0].count,
                                            location: userProfile[0].city,
                                        });
                                        return;
                                        }else{
                                            console.log("Number of likes" + likes[0].count);
                                            console.log("Number of users: " + user_count[0].count);
                                            res.render("usersProfile", {
                                            username: username, 
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
                                            likes: likes[0].count,
                                            users: user_count[0].count,
                                            location: userProfile[0].city,
                                        });
                                        return;
                                        }
                                        console.log("working")
                                    return ;//input code to view user profile
                                    }else if ((req.session.user == result[0].requ_user))
                                    { //this code redirects them to the a page stating the following
                                    res.render('block_page', {data:{x:'You have been blocked by ' + result[0].username}});
                                    console.log("Person has been blocked");
                                    }
                                    })

                                    
                            
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
        });
    });
        
            }
 
});


router.post('/interests',urlencodedParser, (req, res)=>{
    var interest = req.body.interests;
    if(interest.startsWith("#", 0)){
      interest = interest.replace(/\s+/g, '');
    }
    else{
      interest = "#" + interest;
      interest = interest.replace(/\s+/g, '');
    }

    con.query("SELECT count(*) as total FROM filter_tags", req.session.user, function (err, result) {
    if (result[0].total >= 6) {
      console.log("Max tag limit reached");
      //req.session.Msg = "Max tag limit reached";
      con.query("SELECT * FROM filter_tags",function (err, interests) {
        if (err) throw err;
        res.render("filter", {tag: interests, username: req.session.user })
    })
    }else{
        con.query("INSERT INTO filter_tags (interests)  VALUES (?)", [interest], function (err, user_count) {
            if (err) throw err;
        })

        con.query("SELECT * FROM filter_tags",function (err, interests) {
            if (err) throw err;
            res.render("filter", {tag: interests, username: req.session.user })
        })
    }
})

 });

 router.post('/deleteInterest',urlencodedParser, function (req, res) {
    var tagId = req.body.deleteTag;
    var user = req.session.user;

    con.query("DELETE from `filter_tags` WHERE id = ?", [tagId], function (err, result) {
      if (err) {
        console.log(err);
        con.query("SELECT * FROM filter_tags",function (err, interests) {
            if (err) throw err;
            res.render("filter", {tag: interests, username: req.session.user })
        })
      } else { 
        console.log(" Tag deleted succesfully");
        con.query("SELECT * FROM filter_tags",function (err, interests) {
            if (err) throw err;
            res.render("filter", {tag: interests, username: req.session.user })
        })
      }
    })

  });

module.exports = router;
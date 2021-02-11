var express = require("express");
var bodyParser = require("body-parser");
// var CircularJSON = require('circular-json');
let x = {};
let count_value = {};
let likes ={};
table_images = {};
disable_likes = {};
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var router = express.Router();
var con = require("../config/connection");
const session = require("express-session");

router.get("/", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if(!req.session.user){
    res.render("login",{msg: "Please log in"});
      }
      else{
        res.render("search_user", { data: { x,count_value,likes,disable_likes, table_images } });
        x = {};
        like = {};
        count_value = {};
        table_images = {};
        disable_likes = {};
        return false;
      }
});


router.post("/", urlencodedParser, function (req, res) {
  var output1 = req.body.search_user_match;
  if (!output1) {
    res.render("search_user", { data: { x,count_value,likes,disable_likes, table_images } });
  }
  else {
    con.query("SELECT * FROM images WHERE username =(?);", [output1], function (err, result) {
      table_images = result;
    });

    query_results3 = con.query("SELECT COUNT (*) AS count FROM user_like WHERE username=(?);",[output1] , function (err, rows) {
      likes = rows[0].count;
      console.log("Number of likes" + likes);
    });

    query_results2 = con.query("SELECT COUNT (*) AS count FROM user ;",function (err, rows) {
      count_value = rows[0].count;
      console.log("Number of users: " + count_value);
    });


    query_results = con.query("SELECT * FROM user_profile WHERE username =(?);", [output1], function (err, result) {
      x = result;
    });

    query_results4 = con.query("SELECT * FROM user_profile WHERE username =(?);", [req.session.user], function (err, result) {
      if(!result[0])
      {
        disable_likes = null;
      }
      else
      {
        disable_likes = result[0].username;
        console.log("the result are : " + result[0].username);
      }
    });

    req.session.connect_invite = query_results.values;
    var url = "/filter/"+ output1;
    res.redirect(url);
  }

});
module.exports = router;
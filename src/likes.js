var express = require("express");
var con = require("../config/connection");
var session = require("express-session");
var router = express.Router();
var con = require("../config/connection");

router.get("/", function (req, res) {
  if(!req.session.profile)
        res.redirect("/setProfile")
   else{
     con.query("INSERT INTO user_like(username,requ_user) VALUES(?,?) ", [req.session.user,req.session.connect_invite], function (err, result) {
         console.log('Likes send to ' + req.session.connect_invite);
     })
     /////////////////
     con.query("UPDATE `user_filter` SET `likes`= (`likes` + 1) WHERE `username` = ?", [req.session.connect_invite], function (err, result) {
       console.log('Likes send to ' + req.session.connect_invite);
     })
     var url = "/filter/"+ req.session.connect_invite;
     res.redirect(url);
   }     
});
  module.exports = router;
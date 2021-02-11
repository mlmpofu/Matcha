var express = require("express");
var con = require("../config/connection");
var session = require("express-session");
var router = express.Router();
var con = require("../config/connection");

router.get("/", function (req, res) {
  if(!req.session.profile)
        res.redirect("/setProfile")
   else{
  con.query("INSERT INTO user_invite(username,requ_user) VALUES(?,?) ", [req.session.user,req.session.connect_invite], function (err, result) {
      console.log('Invites/Connect  request send to ' + req.session.connect_invite);
    })
    var url = "/filter/"+ req.session.connect_invite;
res.redirect(url);
  }
});
module.exports = router;
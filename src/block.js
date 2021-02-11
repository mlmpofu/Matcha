var express = require("express");
var con = require("../config/connection");
var session = require("express-session");
var router = express.Router();
var con = require("../config/connection");

router.get("/", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if(!req.session.profile)
        res.redirect("/setProfile")
   else{
con.query("INSERT INTO user_block(username,requ_user) VALUES(?,?) ", [req.session.user,req.session.connect_invite], function (err, result) {
    console.log('You have blocked' + req.session.connect_invite);
})
var url = "/filter/"+ req.session.connect_invite;
res.redirect(url);
}

});
  module.exports = router;
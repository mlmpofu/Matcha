var express = require("express");
var con = require("../config/connection");
var session = require("express-session");
var router = express.Router();
var con = require("../config/connection");

router.get("/", function (req, res) {
con.query("INSERT INTO user_report(username,requ_user) VALUES(?,?) ", [req.session.user,req.session.connect_invite], function (err, result) {
    console.log('You have reported ' + req.session.connect_invite);
})
});
  module.exports = router;
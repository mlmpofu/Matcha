var express = require("express");
var con = require("../config/connection");
var session = require("express-session");
var router = express.Router();
var con = require("../config/connection");
var bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get("/", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
   
  if (!req.session.user) {
    res.render("login", { msg: "Please log in" });
  } else {
      if(!req.session.profile)
        res.redirect("/setProfile")
    else{
        con.query("SELECT * FROM views WHERE viewer =(?);", [req.session.user], function (err, result) {
            res.render("user_history", {history: result, username: req.session.user});
        });
    }
}
});


router.post("/view", urlencodedParser, function (req, res) {
    var id = req.body.viewProfile;
     
    con.query("SELECT viewed FROM views WHERE id =(?);", [id], function (err, result) {
        //console.log(result[0].viewed)
        var url = "/filter/"+ result[0].viewed
        res.redirect(url);
    });
  
      
  });
  module.exports = router;
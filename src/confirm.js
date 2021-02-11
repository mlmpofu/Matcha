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

    var user = req.query.user;
    var key = req.query.key;

    con.query("SELECT verifkey FROM `user` WHERE `username` = ? ", [user], function (err, result, fields) {
        if (err) throw err;
        if (result.length) {
             if(result[0].verifkey == key){
                con.query("UPDATE user SET `verified` = 1 Where  `username` = ?",[user], function (err, result) {
                    if (err) {
                    status = "Unable to verify email";
                    console.log(status);
                    console.log(err);
                    res.redirect("/login");
                    } else {
                    console.log("email verfied");
                    res.redirect("/login");
                    }
                }
                  );
             }
        }
    });
});

module.exports = router;

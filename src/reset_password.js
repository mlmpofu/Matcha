var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var bcrypt = require("bcrypt");
var con = require("../config/connection");

// con.connect(function (err) {
//   if (err) {
//     console.log(" reset password Unable to connect to the database");
//   } else {
//     console.log("Connection to the database successful");
//   }
// });

router.get("/", function (req, res) {
  res.render("reset_password", { msg: "please enter your username" });
});

router.post("/", urlencodedParser, function (req, res) {
  var username = req.body.username;
  var newPassword = Math.random().toString(36).substr(2, 8);
  var hashed_pass = bcrypt.hashSync(newPassword, 15);

  con.query("SELECT email FROM user WHERE username = ?", [username], function (
    err,
    result
  ) {
    if (err) {
      console.log(err);
    } else {
      if (result.length) {
        var email = result[0].email;

        con.query(
          "UPDATE user SET `password` = ? Where `username` = ?",
          [hashed_pass, username],
          function (err, result) {
            if (err) {
              status = "Unable to update password";
              console.log(status);
              console.log(err);
              res.redirect("/login");
            } else {
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "wtcmatcha2020@gmail.com",
                  pass: "Matcha123",
                },
                tls: { rejectUnauthorized: false },
              });

              var mailOptions = {
                from: "wtcmatcha2020@gmail.com",
                to: email,
                subject: username + " password reset",
                html:
                  "<html><body><div align=center> \
                        Your username: " + username +" \
                        <br/>\
                        Your new password: " + newPassword +"\
                        </div><br/><br/>\
                        <div align=center>\
                        <p>Please use the provided password to login and change your password</p>\
                        </div></body></html>",
              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                  res.render("login", {
                    msg: "an email has been sent to reset your password",
                  });
                }
              });
            }
          }
        );
      }
    }
  });
});

module.exports = router;

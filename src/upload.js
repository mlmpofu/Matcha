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

const PATH = "./public/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Allowed only .png, .jpg, .jpeg and .gif"));
    }
  },
});

router.post("/", upload.single("image"), (req, res, next) => {
  if (!req.file.filename || !req.file.path) res.redirect("/setProfile");
  var image_name = req.file.filename;
  var image_path = req.file.path;

  var new_path = image_path.replace("public/", "http://localhost:3000/");

  var record = {
    image_name: image_name,
    image_path: new_path,
    username: req.session.user,
  };
  
  var sql ="SELECT count(*) as total FROM images WHERE username = ?";
  con.query(sql, req.session.user, function (err, result) {
  if (result[0].total >= 5) {
    console.log("Max number of images reached");
    req.session.Msg = "Max number of images reached";
    if (req.session.profile == "done") res.redirect("/updateProfile");
    else res.redirect("/setprofile");
    return;
  } else {
    con.query("INSERT INTO images SET?", record, function (err, result) {
      if (err) {
        status = "Unable to upload image";
        console.log(status);
        console.log(err);
        if (req.session.profile == "done") res.redirect("/updateProfile");
        else res.redirect("/setprofile");
      } else {
        console.log("image added successfully");
        req.session.Msg = null;
        if (req.session.profile == "done") res.redirect("/updateProfile");
        else res.redirect("/setprofile");
      }
    });
  }
})
});

module.exports = router;

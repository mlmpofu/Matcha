var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
var request = require('request');
const router = express.Router()
//const locationModel = require("../model/location");

var con = require("../config/connection");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// router.get("/", function (req, res) {
//   console.log(req.session)


//   res.render('setProfile')
// });

router.post('/', urlencodedParser, (req, res) => {

request('http://ip-api.com/json', function(err, resp){
  if(err) console.log(err.message);
  else{
    var ipinfo = JSON.parse(resp.body);
    var lat = ipinfo.lat;
    var lng = ipinfo.lon;
    var city = ipinfo.city;
    var country = ipinfo.country;

    console.log("lat "+lat)
    console.log("lon "+lng)
    console.log("city "+city)
    console.log("country "+country)


    if (!lat || !lng ||!city || !country)
    req.session.Msg = "Couldnt get location please try again";
  else {
      const query = 'UPDATE user_profile SET latitude = ?, longitude = ?, city = ?, country = ? WHERE username = ?' 
      con.query(query, [lat, lng, city, country, req.session.user], (err, result) => {
        if (err) {
          status = "Unable to submit data";
          console.log(status);
          console.log(err);
          if (req.session.profile == "done") 
            res.redirect("/updateProfile");
          else 
            res.redirect("/setprofile");
        } else { 
          const query = 'UPDATE user_filter SET latitude = ?, longitude = ?, city = ?, country = ? WHERE username = ?' 
          con.query(query, [lat, lng, city, country, req.session.user], (err, result) => {
            if (err) {
              console.log(err);
            }})
          console.log("location uploaded succesfully") ;
          req.session.Msg = null;
          if (req.session.profile == "done") 
            res.redirect("/updateProfile");
          else 
            res.redirect("/setprofile");
        }
      })
    }
  }
});

  
})

module.exports = router;
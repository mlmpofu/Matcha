var express = require("express");
var session = require("express-session");
var bodyParser = require('body-parser');
//var io = require("socket.io");
var app = express();
const geolib = require('geolib');

const server = require('http').createServer(app);
 const io = require('socket.io')(server);
var con = require("./config/connection");

app.set("view engine", "ejs");

server.listen(3000);

var registration = require('./src/registration');
var login = require('./src/login');
var setProfile = require('./src/set_profile');
var upload = require('./src/upload');
var profile = require('./src/profile');
var updateProfile = require('./src/update_profile');
var confirm = require('./src/confirm');
var resetPassword = require('./src/reset_password');
var location = require('./src/location');
var search_user = require('./src/search_user');
var connect = require('./src/connect');
var likes = require('./src/likes');
var block = require('./src/block');
var filter = require('./src/filter');
var chat = require('./src/chat')[0];
var chatjs = require('./src/chat')[1];
var sort = require('./src/sort');
var userHistory = require('./src/user_history');

// app.get("*", function (req, res) {
//   res.render("error");
// });
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'matcha12345',
  resave: false,
  saveUninitialized: true
})) 

app.use('/registration', registration);
app.use('/login', login); 
app.use('/setProfile', setProfile); 
app.use('/uploads', upload); 
app.use('/profile', profile); 
app.use('/updateProfile', updateProfile); 
app.use('/confirm', confirm); 
app.use('/resetPassword', resetPassword);
app.use('/location', location);
app.use('/search_user', search_user);
app.use('/connect',connect);
app.use('/likes',likes);
app.use('/block',block);
app.use('/filter',filter);
app.use('/chat', chat);
app.use('/sort', sort);
app.use('/userHistory', userHistory);
chatjs(io);


app.get("/", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if(!req.session.user){
    res.render('registration', {msg: "Please register"});
  }
  else
     if(!req.session.profile)
     res.redirect("/setProfile");
      else{
        req.session.connect_invite = null;
        req.session.gender = null;
        req.session.minage = null;
        req.session.maxage = null;

        con.query("DELETE FROM filter_locations", function (err, results, fields) {
          if (err) throw err;
      })

        con.query("SELECT latitude, longitude FROM user_filter WHERE username = ?", [req.session.user], function (err, myCo) {
          if (err) throw err;
        con.query("SELECT latitude, longitude, username FROM user_filter WHERE username != ?", [req.session.user], function (err, usersCo) {
          if (err) throw err;
      
          usersCo.forEach(function(row) {
              
              if(geolib.isPointWithinRadius(
                  { latitude: row.latitude, longitude: row.longitude },
                  { latitude: myCo[0].latitude, longitude: myCo[0].longitude },
                  50000
              )){
                  con.query("INSERT INTO filter_locations (username)  VALUES (?)", [row.username], function (err, myCo) {
                      if (err) throw err;
                  })
  
              }
          });
      
      })
  })

        con.query("SELECT COUNT (*) AS count FROM user", function (err, user_count) {
          if (err) throw err;

        con.query("SELECT * FROM `user_profile` WHERE username = ?",[req.session.user], function (err, usersInfo, fields) {
          if (err) throw err;
          ageAbove= usersInfo[0].age + 5;
          ageBelow= usersInfo[0].age - 5;

          con.query("SELECT * FROM user_block WHERE (username = (?) AND requ_user = (?)) ", [req.session.connect_invite, req.session.user], function (err, result) {
            //console.log("the result :" + JSON.stringify(result));
        if (err || !result.length || !result[0].requ_user)
        {
          
          if(usersInfo[0].pref_gender == "bisexual"){
            con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `interests` WHERE `username` = ?)) AND `username` IN (SELECT `username` FROM `filter_locations`) ORDER BY `likes` DESC", [req.session.user, ageBelow, ageAbove, req.session.user], function (err, results, fields) {
              if (err) throw err;
              res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
          })
          }else{
            con.query("SELECT * FROM `user_filter` WHERE `username` != ? AND `gender` = ? AND `age` BETWEEN ? AND ? AND `username` IN (SELECT `username` FROM `interests` WHERE `interests` IN (SELECT `interests` FROM `interests` WHERE `username` = ?)) AND `username` IN (SELECT `username` FROM `filter_locations`)  ORDER BY `likes` DESC", [req.session.user, usersInfo[0].pref_gender, ageBelow, ageAbove, req.session.user], function (err, results, fields) {
              if (err) throw err;
              res.render("home", {userData: results, user: req.session.user, user_count: user_count[0].count});
          })
          }
          }else if ((req.session.user == result[0].requ_user))
          { 
          res.render('block_page', {data:{x:'You have been blocked by ' + result[0].username}});
          console.log("Person has been blocked");
          }
        })
      });
    });
    }
     
  });

  app.get("/logout", function (req, res) {
    var dateUser = new Date().toUTCString();
    console.log("Logout time : " |+dateUser);
    con.query("UPDATE user_profile SET last_seen = (?) WHERE username = (?)", [dateUser,req.session.user]);
      req.session.destroy();
      res.redirect("/login");
    });

///////////////////

app.use(function (request, result, next) {
	result.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

app.use(function (request, result, next) {
  result.setHeader("Access-Control-Allow-Origin", "*");
  next();
})


//an API for get_message
app.get("/get_messages", function (request, result) {
  con.query("SELECT username, message FROM messages ORDER BY message ASC", function (err, messages) {
    //return data will be in JSON format
    result.end(JSON.stringify(messages));
  });
});
app.get("/", function (request, result) {
	result.end("Hello world !");
});

var users = [];
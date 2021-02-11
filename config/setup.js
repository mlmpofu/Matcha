function database() {
  var mysql = require("mysql");
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
  });
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE IF NOT EXISTS matcha", function (err, result) {
      if (err) throw err;
      console.log("Database created!");
      console.log("creating tables...")
    });
  });
}

 function table() {
  var mysql = require("mysql");
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "matcha",
  });
    con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
    var sql =
      "CREATE TABLE IF NOT EXISTS user(id int AUTO_INCREMENT PRIMARY KEY , name varchar(255),surname varchar(255),username varchar(255),email varchar(255),password varchar(255), verifkey int(10), verified boolean, setup boolean)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("user Table created");
    });

    var sql = "CREATE TABLE IF NOT EXISTS images (img_id int(11) AUTO_INCREMENT PRIMARY KEY, image_name varchar(255) , image_path varchar(255) , username varchar(255), profile_pic boolean)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("image Table created");
    });

    var sql = "CREATE TABLE IF NOT EXISTS user_profile (id int AUTO_INCREMENT PRIMARY KEY, gender varchar(255) , pref_gender varchar(255) , bio varchar(255), age int(11), username varchar(255), latitude decimal(20, 10), longitude decimal(20, 10), city varchar(255), country varchar(255), last_seen varchar(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user_profile Table created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS messages (id int AUTO_INCREMENT PRIMARY KEY , username TEXT NOT NULL , message TEXT NOT NULL)";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("message Table created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS interests (id int AUTO_INCREMENT PRIMARY KEY,interests varchar(255), username varchar(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("interests Table created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS user_invite (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255) , requ_user varchar(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user_invite Table created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS user_like (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255) , requ_user varchar(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user_liked Table created");
      });

      var sql = "CREATE TABLE IF NOT EXISTS user_report (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255) , requ_user varchar(255))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user_report Table created");
        });
      
        var sql = "CREATE TABLE IF NOT EXISTS user_block (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255) , requ_user varchar(255))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("user_block Table created");
        });

        var sql = "CREATE TABLE IF NOT EXISTS user_filter (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255), name varchar(255), surname varchar(255),  gender varchar(255) , pref_gender varchar(255) , bio varchar(255), age int(11), image_path varchar(255), profile_pic boolean, likes int(11), latitude decimal(20, 10), longitude decimal(20, 10), city varchar(255), country varchar(255), distance int(11))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("user_filter Table created");
        });

        var sql = "CREATE TABLE IF NOT EXISTS filter_tags (id int AUTO_INCREMENT PRIMARY KEY, interests varchar(255))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("filter_tags Table created");
        })

        var sql = "CREATE TABLE IF NOT EXISTS filter_locations (id int AUTO_INCREMENT PRIMARY KEY, username varchar(255), distance int(11))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("filter_location Table created");
        })

        var sql = "CREATE TABLE IF NOT EXISTS views (id int AUTO_INCREMENT PRIMARY KEY, viewer varchar(255), viewed varchar(255))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("views Table created");
          console.log("Done");
        })
        
  });

}
database();
setTimeout(table, 3500);


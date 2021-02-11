
function deleteImage(img_id, username){

  var con = require("../config/connection");

  con.connect(function (err) {
    if (err) {
      console.log("Unable to connect to  database");
    } else {
      console.log("Connection to  database successful");
    }
  });

    console.log(img_id);
    console.log(username);

    // var sql =
    // "DELETE FROM images WHERE img_id = ? AND username = ?";
    //  con.query(sql, [ img_id, username ], function (err, result, fields) {
    //   if (err) throw err;
    //   console.log("deleted");
    //  // res.render("set_profile", {username: req.session.user, photos: result});
    // });

}

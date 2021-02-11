
var bodyParser = require("body-parser");
var mysql = require("mysql");
//var io = require('socket.io');
const express = require('express');
var router = express.Router();
var con = require("../config/connection");



users = [];
connections = [];
let chating = function (io) {
io.on('connection', function (socket) {
    connections.push(socket);
    console.log('connected: %s socket connected', connections.length);

    //Disconnect
    socket.on('disconnect', function (data) {

        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('connected: %s socket connected', connections.length);

    });
    //send message
    socket.on('send_message', function (data) {
        //console.log("listening from send endpoint");
        io.sockets.emit('new_message', { msg: data, user: socket.username });
        
        io.emit("send_message", { msg: data, user: socket.username});
        
        sql = "INSERT INTO messages (username, message) VALUES(?, ?)";
        
        con.query(sql, [socket.username, data], function(err, result){
            //console.log('iserted into mssgs');
            //
        })
        
    });

    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames() {
        io.sockets.emit('get_users', users)
    }
});

//an API for get_message
// app.get("/get_messages", function(request, result){
//     con.query("SELECT username, message FROM messages", function(err, messages){
//         result.end();
//     });
// })

router.get('/', function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     res.render('chat');
 });
};
module.exports = [ router, chating ];


























// const express = require('express');
// const app = express();
// const http = require('http').Server(app);
// var router = express.Router();
// const io = require('socket.io')(http);

// router.get('/chat', function(req, res) {
//     res.render('chat');
// });

// io.sockets.on('connection', function(socket) {
//     socket.on('username', function(username) {
//         socket.username = username;
//         io.emit('is_online', '<i>' + socket.username + ' join the chat..</i>');
//     });

//     socket.on('disconnect', function(username) {
//         io.emit('is_online', '<i>' + socket.username + ' left the chat..</i>');
//     })

//     socket.on('chat_message', function(message) {
//         io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
//     });

// });

// module.exports = router;


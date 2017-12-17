var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var users = [];
var ids = [];

// use body parser to easy fetch post body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    io.emit('chat message', '<b> User ' + socket.username + " disconnected</b>");
    users.splice(users.indexOf(socket.username), 1);
    ids.splice(ids.indexOf(socket.id), 1);
    io.emit('users', users);
    console.log('User ' + socket.username + ' disconnected');
  });
});

io.on('connection', function(socket){
  var addedUser = false;
  
  socket.on('chat message', function(msg){
    var n = msg.includes("/w");
    if(n) {
      var index = msg.indexOf("/w");
      var messg = msg.replace('/w','');
      var messg2 = messg.slice(index+1);
      var name = messg2.substr(0, messg2.indexOf(" "));
      var i = users.indexOf(name);
      var messg3 = messg2.slice(name.length);
      var send1 = "<b>Whisper from "+ socket.username + ": </b>" + messg3;
      var send2 = "<b>Whisper to "+ name + ": </b>" + messg3;
      io.to(ids[i]).emit('chat message', send1);
      io.to(socket.id).emit('chat message', send2);
    }
    else io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
  
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    addedUser = true;
    io.emit('chat message', '<b> User ' + socket.username + " joined</b>");
    users.push(username);
    ids.push(socket.id);
    console.log('user ' + socket.username + ' joined');
    console.log(users);
    io.emit('users', users);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
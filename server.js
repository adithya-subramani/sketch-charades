const express = require('express');
var MongoClient = require('mongodb').MongoClient;
const db = require('./config/db');
const bodyParser = require('body-parser');
const app = express();
var cors = require('cors');
var path = require('path');

var server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origins: '*:*',
    methods: ["GET", "POST"]
  }
})

app.use(cors())
const port = 8000;

var all_room_info = []
var all_users = []
var onlineUsers = [];

MongoClient.connect(db.url, { useUnifiedTopology: true, useNewUrlParser: true }, (err, database) => {
  if (err) return console.log(err)
  app.use(express.static(path.resolve(__dirname,"build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname,"build", "index.html")
    );
  });
  database = database.db("drawguess")
  io.on('connection', function (socket) {
    const init_data = { rooms: all_room_info }
    setTimeout(function () {

      socket.emit('user_on_connection', init_data)
    }, 200)

    socket.emit('user_on_connection', init_data)
    console.log("User Connected")
    require('./routes')(app, socket, all_room_info, init_data, all_users, io, database, onlineUsers);
  });

  server.listen(port, () => {
    console.log('We are live on ' + port);
  });
})
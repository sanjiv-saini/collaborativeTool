const PORT = 4004 || process.env.PORT;
const DB = "mongodb://localhost:27017/drawingDB";
var mainRouter = require("./routes/index");
var apiRouter = require("./routes/api");

var mongoose = require("mongoose");
var express = require("express");
var morgan = require("morgan");
var bodyParser = require('body-parser');
const path = require('path');
var app = new express();

var http = require('http');
var server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);

mongoose.connect(DB, function (err) {
    if (err) {
        return err;
    }
    else {
        console.log("successfully connected to " + DB);
    }
});

var session = require("express-session")({
    secret: "complex-secret",
    resave: false,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
// Attach session
app.use(session);
// Share session with io sockets
io.use(sharedsession(session));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, '/client/views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '/client')));

app.use('/api', apiRouter);
app.use('/', mainRouter);

server.listen(PORT, function () {
    console.log("Server is listening on port: " + PORT);
});

var line_history = [];
var rooms = ['general'];
var fileData;

io.on('connection', function (socket) {
    var session = socket.handshake.session;
    /*socket.on('end', function (){
        console.log('client disconnected..');
        socket.disconnect(0);
    });*/
    //when server restarts during session
    if (!session.userData) {
        console.log("oops!!server Restarts....");
        //activeUsers=null
        socket.emit('redirect');
    } else {
        var userName = session.userData.userName;
        console.log("New client connected " + userName);
        socket.emit('set_title',userName);
        socket.on('draw_history',function(){
            socket.emit('history', line_history, fileData);
        });
        socket.on('chat message', function (data) {
            console.log("Data received is " + data.msg);
            socket.broadcast.emit('chat message', data.msg, userName);
        });

        socket.on('draw_shape', function (data) {
            console.log("recei " + data);
            if(!data.temp || data.shape=="pencil"||data.shape == "eraser")
                line_history.push(data);
            io.emit('draw_shape', data);
        });
        
        socket.on("clear_canvas",function(){
            line_history=[];
            socket.broadcast.emit("clear_canvas");
        });
        socket.on("clear_file",function(){
            fileData="";
            socket.broadcast.emit("clear_file");
        });

        socket.on('file_data', function (data) {
            fileData = data.para;
            console.log(data.para);
            socket.broadcast.emit('updated_file', data.para);
        });

    }
});
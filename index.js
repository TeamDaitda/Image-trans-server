// index.js

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

var fs = require('fs');

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', function() {
    console.log('DB connected');
});
db.on('error', function(err) {
    console.log('DB ERROR : ', err);
});

// Other settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) { // 1
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type');
    next();
});

// API
app.use('/api/image', require('./api/image'));

// Port setting
// var port = 3000;

const port = process.env.PORT;

app.listen(port, function() {
    console.log('server on! http://localhost:' + port);

    var dir = './uploadedFiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}); //
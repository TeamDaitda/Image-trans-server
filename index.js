// index.js
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const cors = require('cors');
const fs = require("fs")

app.use(cors());

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
var port = 3000;
const hostname = "172.20.10.2";

app.listen(port, hostname, () => {
    console.log('server on! http://' + hostname + ':' + port);

    var dir = './uploadedFiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}); //7
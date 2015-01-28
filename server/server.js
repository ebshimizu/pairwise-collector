var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/../client/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// Connection URL
var url = 'mongodb://localhost:27017/pairwise-collector';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var settings = db.collection('settings');
  var users = db.collection('users');
  var data = db.collection('data');

  io.on('connection', function(s) {
    console.log("Client connected");

    s.on('getFrontPageData', function(fn) {
      console.log('finding data')
      settings.find({'name' : 'core_settings'}).toArray(function(err, result) {
        console.log(result[0]);
        if (!err) {
          fn(result[0].experiment_name, result[0].welcome_text);
        }
        else {
          fn("New Experiment", "[welcome text]");
        }
      });
    });
  });




});
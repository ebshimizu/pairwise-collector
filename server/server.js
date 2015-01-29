var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var userData = {};

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
    userData[s.id] = { "ip" : s.conn.remoteAddress };
    console.log("Client connected from " + s.conn.remoteAddress);

    s.on('getFrontPageData', function(fn) {
      settings.find({'name' : 'core_settings'}).toArray(function(err, result) {
        if (err == null) {
          fn(result[0].experiment_name, result[0].welcome_text);
        }
        else {
          fn("New Experiment", "[welcome text]");
        }
      });
    });

    s.on('login', function(username) {
      // store username with socket for logging purposes
      userData[s.id].username = username;

      // Need to now gather all data to send to the client for the experiment setup.
      // At this point it just needs a list of attributes available for judgement. User will select one
      // and then the comparisons can begin.
      // The settings collection stores available attributes. they are tagged as "attribute."
      settings.find({'type' : 'attribute'}).toArray(function(err, attrs) {
        s.emit('initStage', attrs);
      });
    })
  });




});
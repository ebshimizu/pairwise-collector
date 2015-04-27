var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var http = require('http');
var app = http.createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var userData = {};

app.listen(37018);

function shuffle(array) {
  var i = array.length, j = 0, temp;

  while (i--) {
    j = Math.floor(Math.random() * (i+1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;

  }

  return array;
}


function handler (req, res) {
  //http.get("http://graphics.cs.cmu.edu:80/" + req.url, function(r) {
  //  res.writeHead(r.statusCode);
  //  r.on('data', function(c) {
  //    res.write(c);
  //  }).on('end', function() { res.end(); });
  //});

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

function getPair(s, users, settings, attribute) {
  // Get a user's data object
  users.findOne({"user" : userData[s.id].username, "type" : "phase", "attribute" : attribute}, function(err, usr) {
    if (usr == null) {
      users.insert({"user" : userData[s.id].username, "type" : "phase", "attribute" : attribute, "phase" : 1}, function(err, r) { 
        getPair(s, users, settings, attribute);
      });
      return;
    }

    if (usr.phase == 1) {
      // Phase 1 consists of a user doing exactly one comparison for each example, randomly selected
      // Enumerate available elements
      settings.find({'type' : 'example'}).sort({'id' : 1}).toArray(function(err, examples) {
        users.find({'user' : userData[s.id].username, 'type' : 'response', 'attribute' : attribute}).toArray(function(err, resp) {
          var available = {};
          for (var i = 0; i < examples.length; i++) {
            // List out available examples
            available[examples[i].id] = examples[i].id;
          }

          // Delete examples user has already seen
          for (var i = 0; i < resp.length; i++) {
            delete available[resp[i].x];
            delete available[resp[i].y];
          }

          // Flatten
          arr = Object.keys(available).map(function (key) {return available[key]});

          // if the resulting array is of length 1
          if (arr.length == 1) {
            s.emit('newPair', arr[0], Math.floor(Math.random() * examples.length) + 1);
          }
          else if (arr.length == 0) {
            // move to phase 2
            users.findOneAndUpdate({"user" : userData[s.id].username, "type" : "phase", "attribute" : attribute}, {$set : {"phase" : 2}}, function(err, r) {
              getPair(s, users, settings, attribute);
            });
          }
          else {
            var x = Math.floor(Math.random() * arr.length);
            var y = Math.floor(Math.random() * arr.length);

            while (x == y) {
              y = Math.floor(Math.random() * arr.length);
            }

            s.emit('phaseUpdate', 1, Math.floor(arr.length - 2) + 1);
            s.emit('newPair', arr[x], arr[y]);
          }
        });
      });
    }
    else if (usr.phase == 2) {  
      if (userData[s.id].cache.length == 0) {
        // Generating an attribute pair
        // Should pull two random images that the user has not seen together yet.
        // Available image pairs are stored in the settings collection with type "example"
        // Need to do a series of queries here. Won't be terribly fast.
        settings.find({'type' : 'example'}).sort({'id' : 1}).toArray(function(err, examples) {
          var available = {};

          // enumerate possible pairings.
          for (var i = 0; i < examples.length; i++) {
            available[examples[i].id] = {};
            for (var j = i + 1; j < examples.length; j++) {
              available[examples[i].id][examples[j].id] = examples[j].id;
            }
          }

          // Get list of things user has seen already
          users.find({'user' : userData[s.id].username, 'type' : 'response', 'attribute' : attribute}).toArray(function(err, comp) {
            // remove things user has seen 
            for (var i = 0; i < comp.length; i++) {
              // entries are in the form: { x: id, y: id, ...}
              // x is always the smaller element and should come first

              delete available[comp[i].x][comp[i].y];
            }

            var pairs = [];

            // reformat object for random selection 
            for (var prop in available) {
              if (!available.hasOwnProperty(prop)) {
                continue;
              }
              if (Object.keys(available[prop]).length !== 0) {
                Object.keys(available[prop]).map(function(key) { 
                  pairs.push({"id1" : parseInt(prop), "id2" : available[prop][key]});
                });
              }
            }

            console.log("User " + userData[s.id].username + " has " + pairs.length + " examples remaining for attribute: " + attribute);
            if (pairs.length == 0) {
              s.emit('outOfExamples', attribute);
              return;
            }

            var cacheSize = (pairs.length > 1000) ? 1000 : pairs.length;
            var randPairs = shuffle(pairs);

            for (var j = 0; j < cacheSize; j++) {
              userData[s.id].cache.push(randPairs[j]);
            }

            var selected = userData[s.id].cache.pop();
            userData[s.id].remain = pairs.length - 1;
            s.emit('phaseUpdate', 2, pairs.length - 1);
            s.emit('newPair', selected.id1, selected.id2);
          })
        });
      }
      else {
        var selected = userData[s.id].cache.pop();
        userData[s.id].remain = userData[s.id].remain - 1;
        s.emit('phaseUpdate', 2, userData[s.id].remain);
        s.emit('newPair', selected.id1, selected.id2);
      }
    }
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
    userData[s.id] = { "ip" : s.conn.remoteAddress, "cache" : [], "username" : "" };
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
    });

    s.on('getAttributePair', function(attribute) {
      getPair(s, users, settings, attribute);
    });

    s.on('userSelected', function(chosen, notChosen, relevant, attribute) {
      // Save the entry in the main results database
      // entries are stored with p < q
      var x = (chosen < notChosen) ? chosen : notChosen;
      var y = (chosen < notChosen) ? notChosen : chosen;

      if (relevant === false) {
        // choices were irrelevant
        console.log("Pair " + x + " and " + y + " irrelevant for " + attribute);
        data.findOneAndUpdate({'x' : 0, 'y' : chosen, 'attribute' : attribute }, { $inc: { 'xPy' : 1 } }, { 'upsert' : true }, function(err, doc) { });
        data.findOneAndUpdate({'x' : 0, 'y' : notChosen, 'attribute' : attribute }, { $inc: { 'xPy' : 1 } }, { 'upsert' : true }, function(err, doc) { });
        users.insert({'x' : x, 'y' : y, 'choice' : 0, 'type' : 'response', 'attribute' : attribute, 'user' : userData[s.id].username, 'ip' : userData[s.id].ip}, null, function(err, res) { });
      }
      else {
        data.findOneAndUpdate({'x' : 0, 'y' : chosen, 'attribute' : attribute }, { $inc: { 'yPx' : 1 } }, { 'upsert' : true }, function(err, doc) { });
        data.findOneAndUpdate({'x' : 0, 'y' : notChosen, 'attribute' : attribute }, { $inc: { 'yPx' : 1 } }, { 'upsert' : true }, function(err, doc) { });
        users.insert({'x' : x, 'y' : y, 'choice' : chosen, 'type' : "response", 'attribute' : attribute, 'user' : userData[s.id].username, 'ip' : userData[s.id].ip}, null, function(err, res) { });

        if (x == chosen) {
          console.log(x + " chosen over " + y + " for " + attribute);
          data.findOneAndUpdate({'x' : x, 'y' : y, 'attribute' : attribute}, { $inc: { 'xPy' : 1 } }, { 'upsert' : true }, function(err, doc) { });          
        }
        else if (y == chosen) {
          console.log(y + " chosen over " + x + " for " + attribute);
          data.findOneAndUpdate({'x' : x, 'y' : y, 'attribute' : attribute}, { $inc: { 'yPx' : 1 } }, { 'upsert' : true }, function(err, doc) { });
        }
      }
    });

    s.on('disconnect', function() {
      delete userData[s.id];
    });
  });




});

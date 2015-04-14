var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var http = require('http');
var app = http.createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var userData = {};

app.listen(37018);

function handler (req, res) {
  http.get("http://graphics.cs.cmu.edu:80/" + req.url, function(r) {
    res.writeHead(r.statusCode);
    r.on('data', function(c) {
      res.write(c);
    }).on('end', function() { res.end(); });
  });

  //fs.readFile(__dirname + '/../client/index.html',
  //function (err, data) {
  //  if (err) {
  //    res.writeHead(500);
  //    return res.end('Error loading index.html');
  //  }

  //  res.writeHead(200);
  //  res.end(data);
  //});
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
      if (userData[s.id].cache.length == 0) {
        console.log("User " + userData[s.id].username + " out of queued examples. Rengenerating...");
				// Generating an attribute pair
				// Should pull two random images that the user has not seen together yet.
				// Available image pairs are stored in the settings collection with type "example"
				// Need to do a series of queries here. Won't be terribly fast.
				settings.find({'type' : 'example'}).sort({'id' : 1}).toArray(function(err, examples) {
					var available = {};

					// enumerate possible pairings.
					for (var i = 0; i < examples.length; i++) {
						available[examples[i].id] = [];
						for (var j = i + 1; j < examples.length; j++) {
							available[examples[i].id].push(examples[j].id);
						}
					}

					// Get list of things user has seen already
					users.find({'user' : userData[s.id].username, 'attribute' : attribute}).toArray(function(err, comp) {
						// remove things user has seen 
						for (var i = 0; i < comp.length; i++) {
							// entries are in the form: { p: id, q: id, ...}
							var x1 = available[comp[i].x];
							var idx = x1.indexOf(comp[i].y);

							if (idx != -1)
								x1.splice(idx, 1);
						}

						var pairs = [];

						// reformat object for random selection 
						for (var prop in available) {
							if (!available.hasOwnProperty(prop)) {
								continue;
							}
							for (var i = 0; i < available[prop].length; i++) {
								pairs.push({"id1" : parseInt(prop), "id2" : available[prop][i]});
							}
						}

						console.log("User " + userData[s.id].username + " has " + pairs.length + " examples remaining for attribute: " + attribute);
						if (pairs.length == 0) {
							s.emit('outOfExamples', attribute);
							return;
						}

						for (var j = 0; j < 1000; j++) {
							var selected = pairs[Math.floor(Math.random() * pairs.length)];
							userData[s.id].cache.push(selected);
						}

						var selected = userData[s.id].cache.pop();  
						s.emit('newPair', selected.id1, selected.id2);
					})
				});
      }
			else { 
				// Pull entry from user cache and send back for speed
				var selected = userData[s.id].cache.pop();  
				s.emit('newPair', selected.id1, selected.id2);
        console.log("Cached examples left for user " + userData[s.id].username + ": " + userData[s.id].cache.length);
      }
    });

    s.on('userSelected', function(chosen, notChosen, attribute) {
      // Save the entry in the main results database
      // entries are stored with p < q
      var x = (chosen < notChosen) ? chosen : notChosen;
      var y = (chosen < notChosen) ? notChosen : chosen;

      if (x == chosen) {
        data.findAndModify({'x' : x, 'y' : y, 'attribute' : attribute}, [['x', 1]],
          { $inc: { 'xPy' : 1 } }, { 'upsert' : true }, function(err, doc) {
            users.insert({'x' : x, 'y' : y, 'choice' : chosen, 'attribute' : attribute, 'user' : userData[s.id].username, 'ip' : 
              userData[s.id].ip}, null, function(err, res) {

              });
          });
      }
      else if (y == chosen) {
        data.findAndModify({'x' : x, 'y' : y, 'attribute' : attribute}, [['x', 1]],
          { $inc: { 'yPx' : 1 } }, { 'upsert' : true }, function(err, doc) {
            users.insert({'x' : x, 'y' : y, 'choice' : chosen, 'attribute' : attribute, 'user' : userData[s.id].username, 'ip' : 
              userData[s.id].ip}, null, function(err, res) {

              });
          });
      }
    });

    s.on('disconnect', function() {
      delete userData[s.id];
    });
  });




});

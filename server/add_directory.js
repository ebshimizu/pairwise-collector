var args = process.argv.slice(2);

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:27017/pairwise-collector';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var settings = db.collection('settings');
  var users = db.collection('users');
  var data = db.collection('data');

  // Adds data from the given folder
  // Assumes that the filename of each image is the ID of the image.
  dir = args[0];
  console.log("Adding all files in directory: " + dir);
  r = /(\d+)\.(\w+)/;
  fileNames = fs.readdirSync(dir);

  for (var i = 0; i < fileNames.length; i++) {
  	 name = fileNames[i];
  	 id = parseInt(r.exec(name)[1]);
  	 settings.insert({"id" : id, "type" : "example", "filename" : name }, function(e, r) {});
  	 console.log("Inserted entry with id " + id);
  }

  process.exit(0);
});

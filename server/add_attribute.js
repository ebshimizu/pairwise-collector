var args = process.argv.slice(2);

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:27017/pairwise-collector';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  var settings = db.collection('settings');

  attr = args[0];
  console.log("Adding attribute option: " + attr);

  settings.insert({"name" : attr, "type" : "attribute" }, function(e, r) {});

  process.exit(0);
});

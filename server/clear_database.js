var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/pairwise-collector';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var settings = db.collection('settings');
  var users = db.collection('users');
  var data = db.collection('data');

  // Deletes all data from the users and data collections.
  users.remove(function(err, r) {});
  data.remove(function(err, r) {});
});
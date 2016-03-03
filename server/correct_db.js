var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:27017/attributes';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  var users = db.collection('users');
  var data = db.collection('data');

  console.log("Removing excess relevancy element responses.");

  users.find({'type' : 'response'}).forEach(function(doc) {
    if (doc.choice != 0) {
      var notChosen = (doc.choice == doc.x) ? doc.y : doc.x;
      console.log("ID " + notChosen + " not selected for attribute " + doc.attribute + ", decrementing...");
      data.findOneAndUpdate({'x' : 0, 'y' : notChosen, 'attribute' : doc.attribute }, { $inc : { 'yPx' : -1 } }, { upsert: false}, function(err, r) {});
    }
  }, function(err) {
    console.log("done");
  });

});

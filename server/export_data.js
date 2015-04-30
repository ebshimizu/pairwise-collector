var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:27017/attributes';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var settings = db.collection('settings');
  var users = db.collection('users');
  var data = db.collection('data');

  // Data output will dump a number of csvs into the 'out' folder in the server directory.
  // Data will be in a grid format, with a number (x, y) indicating how many times x was preferred over y.
  // This expects data to be indexed from 1 (so column 1 = example 1)
  settings.find({'type' : 'attribute'}).toArray(function(err, attrs) {
    settings.find({'type' : 'example'}).toArray(function(err, ex) {
      // For each attribute we want to export a file
      for (var i = 0; i < attrs.length; i++) {
        exportCSV(attrs[i].name, data, ex.length, i == (attrs.length - 1));
      }
    });
  });
});


function exportCSV(attributeName, data, numExamples, last) {
  var gather = {};
  
  // initialize object
  // add one to number of examples for dummy element
  for (var i = 0; i < numExamples + 1; i++) {
    gather[i] = [];
  }

  // get all data from database relevant to attribute
  var cursor = data.find({'attribute' : attributeName})

  cursor.forEach(function(resp) {
    // For each document
    var x = resp.x;
    var y = resp.y;
    var xPy = resp.xPy;
    var yPx = resp.yPx;

    if (typeof xPy === 'undefined') {
      xPy = 0;
    }
    if (typeof yPx === 'undefined') {
      yPx = 0;
    }
    gather[x][y] = yPx;
    gather[y][x] = xPy;
  },
  function(err) {
    console.log("writing out file for " + attributeName);
    
    // Do a thing at the end
    var out = "";
    // Write object to string
    // relies entirely on the assumption that the data is arranged with ids from 1-n
    for (var i = 0; i < numExamples + 1; i++) {
      var line = gather[i];
      var first = true;
      for (var j = 0; j < numExamples + 1; j++) {
        if (!first) {
          out = out + ",";
        }

        if (typeof line[j] === 'undefined') {
          out += "0";
        }
        else {
          out += line[j];
        }

        first = false;
      }
      out += "\n";
    }

    // write to file
    fs.writeFileSync("out/" + attributeName + ".csv", out);
    console.log("Saved CSV for " + attributeName);

    //if (last) { process.exit(0); }
  });
}

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:37017/pairwise-collector';

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
        exportCSV(attrs[i].name, data, ex.length);
      }
    });
  });
});


function exportCSV(attributeName, data, numExamples) {
  // get all data from database relevant to attribute
  data.find({'attribute' : attributeName}).toArray(function(err, resp) {
    // drop everything in an object first to sort through data

    var gather = {};

    // initialize object
    for (var i = 0; i < numExamples; i++) {
      gather[i + 1] = [];
    }

    // Popuolate object
    for (var i = 0; i < resp.length; i++) {
      var x = resp[i].x;
      var y = resp[i].y;
      var xPy = resp[i].xPy;
      var yPx = resp[i].yPx;

      if (typeof xPy === 'undefined') {
        xPy = 0;
      }
      if (typeof yPx === 'undefined') {
        yPx = 0;
      }
      gather[x][y - 1] = yPx;
      gather[y][x - 1] = xPy;
    }

    var out = "";
    // Write object to string
    // relies entirely on the assumption that the data is arranged with ids from 1-n
    for (var i = 0; i < numExamples; i++) {
      var line = gather[i + 1];
      var first = true;
      for (var j = 0; j < numExamples; j++) {
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
    fs.writeFile("out/" + attributeName + ".csv", out, function(err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Saved CSV for " + attributeName);
      }
    });
  });
}

var mongodb = require('mongodb');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var dbURL = "mongodb://127.0.0.1:27017/integration_test";
var db;

// Initialize connection once
const connect = MongoClient.connect(dbURL, function(err, database) {
  if(err) return console.error(err);

  db = database;

  // the Mongo driver recommends starting the server here 
  // because most apps *should* fail to start if they have no DB.
  // If yours is the exception, move the server startup elsewhere. 
});

module.exports = connnect;
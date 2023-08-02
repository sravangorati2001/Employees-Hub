

const { MongoClient } = require('mongodb');
require('dotenv').config()
const connectionString = 'mongodb+srv://sravangorati2001:sravangorati2001@employeeshub.v2cwab6.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db('employeeshub');
      console.log('Successfully connected to MongoDB.');

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
const mongoose = require('mongoose');
require('dotenv').config();
//setup mongoDB connection

mongoose.connect (process.env.MONGODB_URL_LOCAL); //Replace 'mydatabase' with your database name
//mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', () => {
  console.log('connected to mongoDB server');
})

db.on('error',(err) => {
  console.log('MongoDB connection error',err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

//export the database connection
module.exports = db;
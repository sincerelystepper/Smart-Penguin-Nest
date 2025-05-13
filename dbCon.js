// dbCon.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  await client.connect(); // safe to call multiple times
  return client;
}

module.exports = { connectToDatabase };
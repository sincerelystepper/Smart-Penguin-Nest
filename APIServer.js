const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToDatabase } = require('./dbCon');

console.log(connectToDatabase);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://penguin-application.onrender.com'
}));

app.use(express.json());

app.post('/add-data', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data"); // Explicitly call db() on the client
    const collection = db.collection("Temperature");

    const data = {
      temperature: parseFloat(req.body.temperature),
      timestamp: new Date(req.body.timestamp),
    };

    if (!data.temperature || isNaN(data.temperature) || isNaN(data.timestamp.getTime())) {
      return res.status(400).send("Missing or invalid fields");
    }

    await collection.insertOne(data);
    res.status(200).send("✅ Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err.message);
    res.status(500).send("❌ Error inserting data");
  }
});

app.get('/data', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Temperature");

    const { start, end } = req.query;
    let filter = {};

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        filter.timestamp = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }

    const data = await collection.find(filter).sort({ timestamp: 1 }).toArray();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res.status(500).send("❌ Error fetching data");
  }
});


app.get('/', (req, res) => {
  res.send("👋 API is up and running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});

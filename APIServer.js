const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./dbCon');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173' // Allow Vite dev server
}));
app.use(express.json());

app.post('/add-data', async (req, res) => {
  try {
    const db = await connectToDatabase();
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
    const db = await connectToDatabase();
    const collection = db.collection("Temperature");

    const data = await collection.find().sort({ timestamp: 1 }).toArray();
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

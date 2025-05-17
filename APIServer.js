const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToDatabase } = require('./dbCon');

const { Parser } = require('json2csv');


console.log(connectToDatabase);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://penguin-application.onrender.com'
}));

app.use(express.json());

app.post('/addTemp', async (req, res) => { // Post request to send temperature data
  /** Example of how to use this endpoint with curl
   /curl -X POST https://server-api-609n.onrender.com/addTemp \
   -H "Content-Type: application/json" \
   -d '{"temperature": 22.5, "timestamp": "2025-05-13T14:30:00Z"}'
  */
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
    res.status(200).send("Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err.message);
    res.status(500).send("Error inserting data");
  }
});

app.post('/addFoodMass', async (req, res) => { // Post request to send food mass data
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data"); // Explicitly call db() on the client
    const collection = db.collection("Food Mass");

    const data = {
      penguinID: parseFloat(req.body.penguinID),
      foodMass: parseFloat(req.body.foodMass),
      timestamp: new Date(req.body.timestamp),
    };

    if (!data.foodMass || isNaN(data.foodMass) || isNaN(data.timestamp.getTime())) {
      return res.status(400).send("Missing or invalid fields");
    }

    await collection.insertOne(data);
    res.status(200).send("✅ Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err.message);
    res.status(500).send("❌ Error inserting data");
  }
});

app.post('/addBodySize', async (req, res) => { // Post request to send body size data
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data"); // Explicitly call db() on the client
    const collection = db.collection("Body Size");

    const data = {
      bodySize: parseFloat(req.body.bodySize),
      timestamp: new Date(req.body.timestamp),
    };

    if (!data.bodySize || isNaN(data.bodySize) || isNaN(data.timestamp.getTime())) {
      return res.status(400).send("Missing or invalid fields");
    }

    await collection.insertOne(data);
    res.status(200).send("✅ Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err.message);
    res.status(500).send("❌ Error inserting data");
  }
});

app.get('/tempData', async (req, res) => { // Get request to fetch temperature data
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
    res.status(500).send("Error fetching data");
  }
});

app.get('/downloadTempData', async (req, res) => { // Get request to download temperature data as CSV
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Temperature");

    const data = await collection.find({}).sort({ timestamp: 1 }).toArray();

    if (!data.length) {
      return res.status(404).send("No data available to download.");
    }

    const fields = ['temperature', 'timestamp'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('temperature_data.csv');
    return res.send(csv);
  } catch (err) {
    console.error("CSV Download Error:", err.message);
    res.status(500).send("Error generating CSV file");
  }
});

app.get('/downloadTempDataFiltered', async (req, res) => {
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
        filter.timestamp = { $gte: startDate, $lte: endDate };
      }
    }

    const data = await collection.find(filter).sort({ timestamp: 1 }).toArray();
    if (!data.length) return res.status(404).send("No data to download");

    const fields = ['temperature', 'timestamp'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('filtered_temperature_data.csv');
    return res.send(csv);
  } catch (err) {
    console.error("CSV Download Error:", err.message);
    res.status(500).send("Error generating CSV");
  }
});


app.get('/', (req, res) => {
  res.send("API is up and running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});

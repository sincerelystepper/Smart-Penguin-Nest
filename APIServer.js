const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToDatabase } = require('./dbCon');
const path = require('path');

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
      timestamp: new Date(req.body.timestamp),
      foodMass: parseFloat(req.body.foodMass),
      penguinID: parseFloat(req.body.penguinID)
      ,
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

app.get('/bodySizeData', async (req, res) => { // Get request to fetch body size data
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Body Size");

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
    console.error("Error fetching body size data:", err.message);
    res.status(500).send("Error fetching body size data");
  }
});

app.get('/foodMassData', async (req, res) => { // Get request to fetch food mass data
  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Food Mass");

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
    console.error("Error fetching food mass data:", err.message);
    res.status(500).send("Error fetching food mass data");
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

app.get('/downloadTempDataFiltered', async (req, res) => { // Get request to download filtered temperature data as CSV
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

app.get('/avgTemp', async (req, res) => { // Get request to fetch average temperature data
  const { rangeType, year, month } = req.query;

  if (!year || isNaN(year)) {
    return res.status(400).json({ error: "Missing or invalid year parameter" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Temperature");

    let data;

    if (rangeType === 'year') {
      data = await getMonthlyAverage(collection, parseInt(year));
    } else if (rangeType === 'month') {
      if (!month || isNaN(month)) {
        return res.status(400).json({ error: "Missing or invalid month parameter" });
      }
      data = await getDailyAverage(collection, parseInt(year), parseInt(month));
    } else {
      return res.status(400).json({ error: 'Unsupported rangeType' });
    }

    res.json(data);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/avgBodySize', async (req, res) => { // Get request to fetch average bodySize data
  const { rangeType, year, month } = req.query;

  if (!year || isNaN(year)) {
    return res.status(400).json({ error: "Missing or invalid year parameter" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Body Size");

    let data;

    if (rangeType === 'year') {
      data = await getMonthlyAverage(collection, parseInt(year));
    } else if (rangeType === 'month') {
      if (!month || isNaN(month)) {
        return res.status(400).json({ error: "Missing or invalid month parameter" });
      }
      data = await getDailyAverage(collection, parseInt(year), parseInt(month));
    } else {
      return res.status(400).json({ error: 'Unsupported rangeType' });
    }

    res.json(data);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/avgFoodMass', async (req, res) => { // Get request to fetch average foodMass data
  const { rangeType, year, month } = req.query;

  if (!year || isNaN(year)) {
    return res.status(400).json({ error: "Missing or invalid year parameter" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("Penguin_Data");
    const collection = db.collection("Food Mass");

    let data;

    if (rangeType === 'year') {
      data = await getMonthlyAverage(collection, parseInt(year));
    } else if (rangeType === 'month') {
      if (!month || isNaN(month)) {
        return res.status(400).json({ error: "Missing or invalid month parameter" });
      }
      data = await getDailyAverage(collection, parseInt(year), parseInt(month));
    } else {
      return res.status(400).json({ error: 'Unsupported rangeType' });
    }

    res.json(data);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function getMonthlyAverage(collection, year) {
  // Determine the numeric field to average based on collection name
  let name = collection.collectionName === "Body Size" ? "bodySize" :
    collection.collectionName === "Temperature" ? "temperature" :
    collection.collectionName === "Food Mass" ? "foodMass" : null;
  if (!name) {
    throw new Error("Invalid collection name");
  }

  // If the collection is Food Mass, group by both month and penguinID
  const groupId = collection.collectionName === "Food Mass"
    ? { month: { $month: "$timestamp" }, penguinID: "$penguinID" }
    : { month: { $month: "$timestamp" } };

  return collection.aggregate([
    {
      $match: {
        timestamp: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: groupId,
        [`avg${name.charAt(0).toUpperCase() + name.slice(1)}`]: { $avg: `$${name}` }
      }
    },
    { $sort: { "_id.month": 1, "_id.penguinID": 1 } }
  ]).toArray();
}

async function getDailyAverage(collection, year, month) {
  // Map collection name to field name
  let name = collection.collectionName === "Body Size" ? "bodySize" :
    collection.collectionName === "Temperature" ? "temperature" :
    collection.collectionName === "Food Mass" ? "foodMass" : null;
  if (!name) {
    throw new Error("Invalid collection name");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // If Food Mass, group by day and penguinID
  const groupId = collection.collectionName === "Food Mass"
    ? {
        year: { $year: "$timestamp" },
        month: { $month: "$timestamp" },
        day: { $dayOfMonth: "$timestamp" },
        penguinID: "$penguinID"
      }
    : {
        year: { $year: "$timestamp" },
        month: { $month: "$timestamp" },
        day: { $dayOfMonth: "$timestamp" }
      };

  return collection.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },
    {
      $group: {
        _id: groupId,
        [`avg${name.charAt(0).toUpperCase() + name.slice(1)}`]: { $avg: `$${name}` }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.penguinID": 1 } }
  ]).toArray();
}

app.get('/', (req, res) => {
  res.send("API is up and running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

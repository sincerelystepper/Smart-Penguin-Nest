const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Admin:RWRd0sWxWVe87MlB@eee4113fgroup9.ivnnnaq.mongodb.net/?retryWrites=true&w=majority&appName=EEE4113FGroup9";
const client = new MongoClient(uri);

app.post('/add-data', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const collection = db.collection("users");

    const data = req.body;
    if (!data.name || !data.email) {
      return res.status(400).send("Missing fields: 'name' or 'email'");
    }

    await collection.insertOne(data);
    res.status(200).send("✅ Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err.message);
    res.status(500).send("❌ Error inserting data");
  } finally {
    await client.close();
  }
});

app.get('/', (req, res) => {
  res.send("👋 API is up and running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});

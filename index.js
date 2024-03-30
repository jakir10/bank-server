const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvtteka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to connect to the database
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const database = client.db("bankData");
    const fdrAccountsCollection = database.collection("fdrAccounts");
    // const bankAgentCollection = database.collection("bankAgents");

    // This route handles the GET request to the root URL
    app.get("/", (req, res) => {
      res.send("Bank is running");
    });

    // POST route to create an FDR account
    app.post("/submits", async (req, res) => {
      try {
        const fdrAccountData = req.body;
        const result = await fdrAccountsCollection.insertOne(fdrAccountData);
        res.status(201).json(result);
      } catch (error) {
        console.error("Failed to insert FDR account data:", error);
        res.status(500).json({ message: "Failed to insert FDR account data" });
      }
    });

    // GET method to retrieve data from fdrAccounts collection
    app.get("/submits", async (req, res) => {
      try {
        // Fetch data from the fdrAccounts collection
        const fdrAccountsData = await fdrAccountsCollection.find({}).toArray();
        res.status(200).json(fdrAccountsData);
      } catch (error) {
        console.error("Failed to fetch FDR account data:", error);
        res.status(500).json({ message: "Failed to fetch FDR account data" });
      }
    });

    app.patch("/submits/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        console.log(updatedData);

        // Remove _id field from updatedData to prevent updating it
        delete updatedData._id;

        // Define the filter for the update operation
        const filter = { _id: new ObjectId(id) };

        // Define options for the update operation to enable upsert
        const options = { upsert: true };

        // Perform the update operation
        const result = await fdrAccountsCollection.updateOne(
          filter,
          { $set: updatedData },
          options
        );

        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
          res.status(200).json({ message: "Data updated successfully" });
        } else {
          res.status(500).json({ message: "Failed to update data" });
        }
      } catch (error) {
        console.error("Failed to update or insert FDR account data:", error);
        res
          .status(500)
          .json({ message: "Failed to update or insert FDR account data" });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Bank server is running on port ${port}`);
    });
  } finally {
    // In a real app, you might close the client when the app is terminating.
    // For simplicity, we're not doing it here.
  }
}

run().catch(console.dir);

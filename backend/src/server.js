import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

const MONGO_URI = "mongodb://localhost:27017";
const client = new MongoClient(MONGO_URI);

let db;
async function connectDB() {
  await client.connect();
  db = client.db("bjj_academy");
  console.log("Connected to MongoDB");
}
connectDB();

// --- ROUTES ---

// simple test
app.get("/hello", (req, res) => {
  res.send("Hello!");
});

// GET user by dynamic ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id); // convert :id to a number

    const user = await db.collection("users").findOne({ id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET all plans
app.get("/api/plans", async (req, res) => {
  try {
    const plans = await db.collection("plans").find().toArray();
    res.json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});

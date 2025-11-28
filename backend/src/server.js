import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

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

// GET all classes
app.get("/api/classes", async (req, res) => {
  try {
    const classes = await db.collection("classes").find().toArray();
    res.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET all teachers
app.get("/api/teachers", async (req, res) => {
  try {
    const teachers = await db.collection("teachers").find().toArray();
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET teacher by ID
app.get("/api/teachers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const teacher = await db.collection("teachers").findOne({ id });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (err) {
    console.error("Error fetching teacher:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET all scheduled classes
app.get("/api/scheduled-classes", async (req, res) => {
  try {
    const limitParam = req.query.limit;
    const coll = db.collection("scheduledClasses");
    let cursor = coll.find();

    if (limitParam !== undefined) {
      const parsed = parseInt(limitParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        cursor = cursor.limit(parsed);
      }
    }

    const scheduled = await cursor.toArray();
    res.json(scheduled);
  } catch (err) {
    console.error("Error fetching scheduled classes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ensure uploads dir exists and serve it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/uploads - single file field named 'file'
app.post("/api/uploads", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});

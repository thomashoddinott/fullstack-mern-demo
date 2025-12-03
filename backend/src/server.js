import express from "express";
import multer from "multer";
import { MongoClient, Binary } from "mongodb";

const app = express();
app.use(express.json());

// Multer memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
// GET user avatar by userId
app.get("/api/users/:id/avatar", async (req, res) => {
  try {
    const userId = Number(req.params.id); // convert :id to a number
    const userAvatar = await db.collection("user-avatars").findOne({ userId });

    if (!userAvatar || !userAvatar.avatar) {
      return res.status(404).json({ message: "User avatar not found" });
    }

    // Remove the data:image/jpeg;base64, prefix if it exists
    const base64Data = userAvatar.avatar.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageBuffer.length);
    
    // Send the image
    res.send(imageBuffer);
  } catch (err) {
    console.error("Error fetching user avatar:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET only booked_classes_id for a user
app.get("/api/users/:id/booked-classes-id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid user id" });

    const doc = await db.collection("users").findOne({ id }, { projection: { booked_classes_id: 1, _id: 0 } });

    if (!doc) return res.status(404).json({ message: "User not found" });

    // If the field doesn't exist, return an empty array for convenience
    const booked = doc.booked_classes_id ?? [];
    res.json({ booked_classes_id: booked });
  } catch (err) {
    console.error("Error fetching booked_classes_id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT user avatar (accepts multipart/form-data with field `avatar`)
app.put("/api/users/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return res.status(400).json({ message: "Invalid user id" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No avatar file uploaded (field name: 'avatar')" });
    }

    const mime = req.file.mimetype || "image/jpeg";
    const buffer = req.file.buffer;

    // Store both a data-URI string (for easy retrieval) and binary data (for tools/users that want raw bytes)
    const base64 = buffer.toString("base64");
    const dataUri = `data:${mime};base64,${base64}`;

    await db.collection("user-avatars").updateOne(
      { userId },
      { $set: { userId, avatar: dataUri, data: new Binary(buffer) } },
      { upsert: true }
    );

    res.json({ message: "Avatar updated", userId });
  } catch (err) {
    console.error("Error updating user avatar:", err);
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

// GET scheduled class by ID
app.get("/api/scheduled-classes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid class id" });

    const scheduledClass = await db.collection("scheduledClasses").findOne({ id });

    if (!scheduledClass) return res.status(404).json({ message: "Scheduled class not found" });

    res.json(scheduledClass);
  } catch (err) {
    console.error("Error fetching scheduled class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update a user's booked classes
// Body can be either:
// { booked_classes_id: [1,2,3] }    -> replace the array
// { action: 'remove', classId: 5 }   -> remove single id
// { action: 'add', classId: 5 }      -> add single id (no duplicates)
app.put("/api/users/:id/booked-classes", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid user id" });

    const { booked_classes_id, action, classId } = req.body || {};

    const coll = db.collection("users");

    // Ensure user exists
    const user = await coll.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (Array.isArray(booked_classes_id)) {
      // Replace the array
      await coll.updateOne({ id }, { $set: { booked_classes_id } });
    } else if (action === "remove" && typeof classId !== "undefined") {
      await coll.updateOne({ id }, { $pull: { booked_classes_id: classId } });
    } else if (action === "add" && typeof classId !== "undefined") {
      await coll.updateOne({ id }, { $addToSet: { booked_classes_id: classId } });
    } else {
      return res.status(400).json({ message: "Invalid body. Provide booked_classes_id array or action + classId." });
    }

    const updated = await coll.findOne({ id }, { projection: { booked_classes_id: 1, _id: 0 } });
    return res.json({ booked_classes_id: updated.booked_classes_id ?? [] });
  } catch (err) {
    console.error("Error updating booked_classes_id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});

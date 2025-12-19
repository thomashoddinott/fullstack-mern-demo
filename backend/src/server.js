import express from "express";
import multer from "multer";
import { MongoClient, Binary } from "mongodb";
import cors from "cors"; // is this necessary at this stage?
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());
app.use(cors()); // allow frontend requests

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

app.get("/api/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await db.collection("users").aggregate([
      { $match: { id } },
      {
        $addFields: {
          "subscription.status": {
            $cond: {
              if: { 
                $gte: [
                  { $dateFromString: { dateString: "$subscription.expiry" } },
                  new Date()
                ]
              },
              then: "Active",
              else: "Inactive"
            }
          }
        }
      }
    ]).toArray();

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
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

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create transporter using SMTP credentials from env
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `Contact form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<h3>New Contact Form Submission</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending contact email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// GET plan by plan id (returns single plan)
app.get("/api/plans/:planId", async (req, res) => {
  try {
    const planId = req.params.planId;
    if (!planId) return res.status(400).json({ message: "Missing plan id" });

    // Support finding by either `id` (seeded) or `plan_id` (if used elsewhere)
    const plan = await db
      .collection("plans")
      .findOne({ $or: [{ id: planId }, { plan_id: planId }] });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Return the plan object (caller can read `.label`)
    res.json(plan);
  } catch (err) {
    console.error("Error fetching plan:", err);
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
    let cursor = coll.find().sort({ start: 1 });

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

// PUT update spots_booked for scheduled class (plus1 or minus1)
app.put("/api/scheduled-classes/:id/:action", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid class id" });

    const action = req.params.action;
    let delta;
    if (action === "plus1") delta = 1;
    else if (action === "minus1") delta = -1;
    else return res.status(400).json({ message: "Action must be plus1 or minus1" });

    const coll = db.collection("scheduledClasses");
    
    // First, get the current document to check constraints
    const currentDoc = await coll.findOne({ id });
    if (!currentDoc) return res.status(404).json({ message: "Scheduled class not found" });

    const newSpotsBooked = currentDoc.spots_booked + delta;

    // Check lower bound
    if (newSpotsBooked < 0) {
      return res.status(400).json({ 
        message: "Cannot decrease spots below 0",
        current: currentDoc.spots_booked 
      });
    }

    // Check upper bound
    if (newSpotsBooked > currentDoc.spots_total) {
      return res.status(400).json({ 
        message: "Class is full - cannot exceed total spots",
        spots_booked: currentDoc.spots_booked,
        spots_total: currentDoc.spots_total
      });
    }

    // Perform the update
    const result = await coll.findOneAndUpdate(
      { id },
      { $inc: { spots_booked: delta } },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (err) {
    console.error("Error updating spots:", err);
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

      // Use the stored subscription status on the user object rather than recalculating
      const isInactive = user.subscription?.status === 'Inactive';

    if (Array.isArray(booked_classes_id)) {
      // If this replacement introduces any new class ids compared to existing booked list,
      // treat that as booking activity and block it when the user's subscription is inactive.
      const existing = user.booked_classes_id ?? [];
      const additions = booked_classes_id.filter((cid) => !existing.includes(cid));
      if (additions.length > 0 && isInactive) {
        return res.status(403).json({ message: 'Cannot book classes - subscription inactive' });
      }

      // Replace the array
      await coll.updateOne({ id }, { $set: { booked_classes_id } });
    } else if (action === "remove" && typeof classId !== "undefined") {
      await coll.updateOne({ id }, { $pull: { booked_classes_id: classId } });
    } else if (action === "add" && typeof classId !== "undefined") {
      // Block explicit add attempts when subscription is inactive
      if (isInactive) {
        return res.status(403).json({ message: 'Cannot book classes - subscription inactive' });
      }

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

// New route: extend subscription with plan in URL (e.g. /api/users/0/extend-subscription/3m)
app.patch('/api/users/:id/extend-subscription/:plan', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid user id' });

    const plan = req.params.plan;
    const allowed = { '1m': 1, '3m': 3, '12m': 12 };
    if (!plan || !Object.prototype.hasOwnProperty.call(allowed, plan)) {
      return res.status(400).json({ message: 'Invalid plan. Allowed: 1m, 3m, 12m' });
    }

    const months = allowed[plan];
    const daysToAdd = 31 * months; // use as approximation

    const coll = db.collection('users');
    const user = await coll.findOne({ id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Determine base expiry: existing subscription expiry, or now
    let baseExpiry = null;
    if (user.subscription && user.subscription.expiry) {
      const parsed = new Date(user.subscription.expiry);
      if (!Number.isNaN(parsed.getTime())) baseExpiry = parsed;
    }
    if (!baseExpiry) baseExpiry = new Date();

    const newExpiry = new Date(baseExpiry.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Determine whether the current subscription is inactive (expiry in the past or missing)
    const now = new Date();
    let isInactive = true;
    if (user.subscription && user.subscription.expiry) {
      const parsedExpiry = new Date(user.subscription.expiry);
      if (!Number.isNaN(parsedExpiry.getTime())) {
        isInactive = parsedExpiry.getTime() < now.getTime();
      }
    }

    // Prepare update fields; if the subscription was inactive, reset the start date to today
    const updateFields = {
      'subscription.expiry': newExpiry.toISOString(),
      'subscription.plan_id': plan,
    };
    if (isInactive) {
      updateFields['subscription.start'] = now.toISOString();
    }

    // Update the user's subscription fields
    await coll.updateOne(
      { id },
      { $set: updateFields }
    );

    const updated = await coll.findOne({ id }, { projection: { subscription: 1, _id: 0 } });
    return res.json({ subscription: updated.subscription });
  } catch (err) {
    console.error('Error extending subscription expiry:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});

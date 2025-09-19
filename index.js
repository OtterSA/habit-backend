// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const dotenv = require("dotenv");


dotenv.config();

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 8080;


app.use(cors());
app.use(bodyParser.json());

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

app.get("/ping", (req, res) => {
  console.log("Received GET /ping");
  res.json({ message: "pong" });
});

app.post("/habits", async (req, res) => {
  try {
    console.log("Received POST /habits with body:", req.body);

    const { name } = req.body;
    if (!name || !name.trim()) {
      console.log("Missing 'name'");
      return res.status(400).json({ error: 'Missing "name"' });
    }

    console.log("🗄 Attempting to save to Firestore...");
    const newRef = await db.collection("habits").add({
      name: name.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Saved habit with ID:", newRef.id);
    res.status(201).json({ id: newRef.id });
  } catch (err) {
    console.error("Firestore error:", err);
    res.status(500).json({ error: "Failed to save habit" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

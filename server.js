require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const notesRouter = require("./routes/notes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SapphireIQ Notes/Task API is running",
    endpoints: {
      health: "GET /health",
      notes: "GET /api/notes",
      createNote: "POST /api/notes",
      singleNote: "GET /api/notes/:id",
      updateNote: "PATCH /api/notes/:id",
      deleteNote: "DELETE /api/notes/:id"
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/notes", notesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
});

app.use(errorHandler);

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("Missing MONGODB_URI. Add it to your .env file.");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB connected successfully.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`SapphireIQ Notes/Task API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) start();
module.exports = app;

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
const notesFile = path.join(__dirname, "notes.json");

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Quick Note API is running!");
});

// GET /notes
app.get("/notes", (req, res) => {
  try {
    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to read notes",
    });
  }
});

// POST /notes
app.post("/notes", (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    notes.push(newNote);

    fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create note",
    });
  }
});


// PUT /notes/:id
app.put("/notes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));

    const noteIndex = notes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    notes[noteIndex].title = title;
    notes[noteIndex].content = content;

    fs.writeFileSync(
      notesFile,
      JSON.stringify(notes, null, 2)
    );

    res.json({
      message: "Note updated successfully",
      note: notes[noteIndex],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update note",
    });
  }
});
// DELETE /notes/:id
app.delete("/notes/:id", (req, res) => {

    
  try {
    const { id } = req.params;

    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));

    const noteExists = notes.some((note) => note.id === id);

    if (!noteExists) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const updatedNotes = notes.filter((note) => note.id !== id);

    fs.writeFileSync(
      notesFile,
      JSON.stringify(updatedNotes, null, 2)
    );

    res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete note",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
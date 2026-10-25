const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"]
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content cannot be empty"],
      maxlength: [10000, "Content cannot exceed 10000 characters"]
    },
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: [50, "Category cannot exceed 50 characters"]
    },
    completed: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Note", noteSchema);

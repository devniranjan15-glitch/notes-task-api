const express = require("express");
const mongoose = require("mongoose");
const { body, param, query, validationResult } = require("express-validator");
const Note = require("../models/Note");

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: errors.array().map(({ path, msg, location }) => ({ field: path, message: msg, location }))
      }
    });
  }
  next();
}

const idRules = [
  param("id").custom((id) => mongoose.isValidObjectId(id)).withMessage("A valid note ID is required")
];

const createRules = [
  body("title").isString().trim().isLength({ min: 2, max: 120 }).withMessage("Title must be 2–120 characters"),
  body("content").isString().trim().notEmpty().isLength({ max: 10000 }).withMessage("Content is required and must be at most 10000 characters"),
  body("category").optional().isString().trim().isLength({ max: 50 }).withMessage("Category must be at most 50 characters"),
  body("completed").optional().isBoolean().withMessage("Completed must be true or false"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().isLength({ max: 30 }).withMessage("Each tag must be a string of at most 30 characters")
];

router.post("/", createRules, validate, async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

router.get("/", [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("sortBy").optional().isIn(["createdAt", "updatedAt", "title", "category", "completed"]).withMessage("Unsupported sortBy field"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
  query("completed").optional().isIn(["true", "false"]).withMessage("Completed must be true or false"),
  query("category").optional().isString().trim(),
  query("search").optional().isString().trim().isLength({ max: 100 }).withMessage("Search must be at most 100 characters"),
  validate
], async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const filter = {};
    if (req.query.completed !== undefined) filter.completed = req.query.completed === "true";
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { content: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } }
      ];
    }

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit),
      Note.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", idRules, validate, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: "Note not found" } });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", [
  ...idRules,
  body("title").optional().isString().trim().isLength({ min: 2, max: 120 }).withMessage("Title must be 2–120 characters"),
  body("content").optional().isString().trim().notEmpty().isLength({ max: 10000 }).withMessage("Content must be non-empty and at most 10000 characters"),
  body("category").optional().isString().trim().isLength({ max: 50 }).withMessage("Category must be at most 50 characters"),
  body("completed").optional().isBoolean().withMessage("Completed must be true or false"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().isLength({ max: 30 }).withMessage("Each tag must be a string of at most 30 characters"),
  body().custom((value) => Object.keys(value).length > 0).withMessage("Provide at least one field to update"),
  validate
], async (req, res, next) => {
  try {
    const allowed = ["title", "content", "category", "completed", "tags"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const note = await Note.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      context: "query"
    });
    if (!note) return res.status(404).json({ success: false, error: { message: "Note not found" } });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", idRules, validate, async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: "Note not found" } });
    res.status(200).json({ success: true, message: "Note deleted successfully", data: note });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

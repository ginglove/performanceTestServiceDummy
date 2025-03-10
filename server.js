const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const client = require("prom-client");
const { swaggerUi, swaggerDocs } = require("./swagger");
const connectDB = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Define Mongoose Schema & Model
const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /fast:
 *   get:
 *     summary: Fast API response
 *     description: Returns a quick response with a timestamp.
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get("/fast", (req, res) => {
  res.json({ message: "Fast API Response", timestamp: Date.now() });
});

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create an item
 *     description: Adds a new item to MongoDB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */
app.post("/items", async (req, res) => {
  try {
    const item = new Item({ name: req.body.name });
    await item.save();
    res.status(201).json({ message: "Item created", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     description: Returns a list of items stored in MongoDB.
 *     responses:
 *       200:
 *         description: List of items
 */
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     description: Updates an existing item in MongoDB by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 */
app.put("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item updated", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Deletes an item from MongoDB by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 */
app.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Metrics Endpoint for Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`🚀 Performance Test Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
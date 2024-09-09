

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Use CORS to allow cross-origin requests
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// MongoDB Atlas connection string
const uri = "mongodb+srv://aksingh171999:f989DizinC0zmhyt@cluster0.g9xpk.mongodb.net/PageBuilder";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Mongoose schema and model for layout
const layoutSchema = new mongoose.Schema({
  name: String,
  items: [String],
});

const Layout = mongoose.model('Layout', layoutSchema);

// Save layout endpoint
app.post('/save-layout', async (req, res) => {
  const { name, items } = req.body;
  try {
    const newLayout = new Layout({ name, items });
    await newLayout.save();
    res.status(200).json({ message: 'Layout saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving layout' });
  }
});

// Load layout endpoint
app.get('/load-layout', async (req, res) => {
  try {
    const layout = await Layout.findOne(); // Get the first layout for simplicity
    res.status(200).json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Error loading layout' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

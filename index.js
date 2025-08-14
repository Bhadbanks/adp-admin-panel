// index.js
const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // serve login page

// ---- CONFIG ----
// Base password stored in memory
const BASE_PASSWORD = process.env.BASE_PASSWORD || 'ADPsecure#';
const PANEL_ID = process.env.PANEL_ID || '1';
const MASTER_TOKEN = process.env.MASTER_TOKEN || '411320';

// Store full password in memory
const PASSWORD = BASE_PASSWORD + PANEL_ID;

// ---- ROUTES ----

// Login page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Handle login
app.post('/login', (req, res) => {
  const { password, token } = req.body;

  if (!password || !token) {
    return res.status(400).send('<h2 style="color:red;">Password and token required</h2>');
  }

  // Check password + token
  if (password === PASSWORD && token === MASTER_TOKEN) {
    // Store session in memory (simple, for demo)
    req.session = { loggedIn: true };
    return res.redirect('/dashboard');
  } else {
    return res.status(401).send('<h2 style="color:red;">Login failed ❌</h2><p>Invalid credentials</p>');
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  // Simple in-memory check (demo)
  if (!req.session || !req.session.loggedIn) {
    return res.status(403).send('<h2 style="color:red;">Access denied ❌</h2><p>Please login first</p>');
  }

  const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(2);
  const freeMem = (os.freemem() / (1024 * 1024)).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);

  res.send(`
    <h1>ADP Admin Panel ${PANEL_ID} Dashboard ✅</h1>
    <p>Total Memory: ${totalMem} MB</p>
    <p>Used Memory: ${usedMem} MB</p>
    <p>Free Memory: ${freeMem} MB</p>
    <p>Password stored in memory for panel: ${PASSWORD}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`ADP Admin Panel running on port ${PORT}`);
});

// index.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form + JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files (serves public/login.html)
app.use(express.static('public'));

// Simple session (enough for demo + Render)
app.use(session({
  secret: process.env.SESSION_SECRET || 'randomSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // leave false; works behind Render/HTTP
}));

// ---- CONFIG from env ----
const BASE_PASSWORD = process.env.BASE_PASSWORD || 'ADPsecure#';
const PANEL_ID      = process.env.PANEL_ID || '1';
const MASTER_TOKEN  = process.env.MASTER_TOKEN || '411320';
const PASSWORD      = BASE_PASSWORD + PANEL_ID;

// Routes
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) {
    return res.status(400).send('<h2 style="color:red;">Password and token required</h2>');
  }
  if (password === PASSWORD && token === MASTER_TOKEN) {
    req.session.loggedIn = true;
    return res.redirect('/dashboard');
  }
  return res.status(401).send('<h2 style="color:red;">Login failed ❌</h2><p>Invalid credentials</p>');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send('<h2 style="color:red;">Access denied ❌</h2><p>Please login first</p>');
  }
  const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(2);
  const freeMem  = (os.freemem()  / (1024 * 1024)).toFixed(2);
  const usedMem  = (totalMem - freeMem).toFixed(2);

  res.send(`
    <h1>ADP Admin Panel ${PANEL_ID} Dashboard ✅</h1>
    <p>Total Memory: ${totalMem} MB</p>
    <p>Used Memory: ${usedMem} MB</p>
    <p>Free Memory: ${freeMem} MB</p>
    <p>Password stored in memory for panel: ${PASSWORD}</p>
    <p><a href="/logout">Logout</a></p>
  `);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/healthz', (_req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`ADP Admin Panel running on port ${PORT}`);
});

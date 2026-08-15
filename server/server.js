require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const { initDatabase } = require('./db/database');
const authRoutes = require('./routes/auth.routes');
const crudRoutes = require('./routes/crud.routes');
const contactRoutes = require('./routes/contact.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 8000;
const ROOT_DIR = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
    next();
  });
}

// Static File Serving
// 1. Uploaded media
app.use('/uploads', express.static(UPLOADS_DIR));

// 2. Public assets, stylesheets, scripts, partials
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
app.use('/partials', express.static(path.join(ROOT_DIR, 'partials')));
app.use('/data', express.static(path.join(ROOT_DIR, 'data')));

// 3. Admin Panel Static Files
app.use('/admin', express.static(path.join(ROOT_DIR, 'admin')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', crudRoutes);
app.use('/api', contactRoutes);
app.use('/api', uploadRoutes);

// Frontend HTML page routes (direct static file serving)
app.use(express.static(ROOT_DIR));

// Fallback for SPA or unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Initialize database and start listening
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` SAIL Server is running on: http://localhost:${PORT}`);
      console.log(` Admin Panel: http://localhost:${PORT}/admin/login.html`);
      console.log(` Default Admin Password: ${process.env.ADMIN_PASSWORD || 'sail2026'}`);
      console.log(` API Base: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error initializing server:', err);
    process.exit(1);
  }
}

startServer();

/**
 * Customer Portal Backend
 * 
 * Express.js server that integrates with ServiceM8 API
 * Provides endpoints for authentication, bookings, attachments, and messages.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import route handlers
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const attachmentsRoutes = require('./routes/attachments');
const messagesRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Enable CORS for frontend communication
app.use(cors({
  origin: true,  // Allow all origins for POC (in production, restrict this)
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Customer Portal Backend'
  });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/messages', messagesRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Customer Portal Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});


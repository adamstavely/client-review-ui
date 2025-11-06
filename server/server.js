/**
 * Main Express Server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import reviewsRouter from './routes/reviews.js';
import workflowRouter from './routes/workflow.js';
import uploadRouter from './routes/upload.js';
import versionsRouter from './routes/versions.js';
import commentsRouter from './routes/comments.js';
import passwordRouter from './routes/password.js';
import adminRouter from './routes/admin.js';
import teamsRouter from './routes/teams.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/review', reviewsRouter);
app.use('/review', workflowRouter);
app.use('/review', versionsRouter);
app.use('/review', commentsRouter);
app.use('/review', passwordRouter); // Password & expiration routes
app.use('/upload', uploadRouter); // File upload endpoint
app.use('/review', uploadRouter); // Also mount for create-from-url endpoint
app.use('/admin', adminRouter);
app.use('/teams', teamsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create uploads directory if it doesn't exist
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
};

// Start server
const startServer = async () => {
  try {
    await ensureUploadsDir();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;


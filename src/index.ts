import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
// Note: Auth middleware is available at ./middleware/auth.ts
// Currently not enforced to allow frontend development without login.
// Enable it later by uncommenting the line below:
// import { authMiddleware } from './middleware/auth';
// app.use('/api', authMiddleware, routes);
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  logger.info(`Bullfit Retail CRM server running on port ${PORT}`);
});

export default app;

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import workflowRoutes from './routes/workflows';

const app: Express = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

// Routes
app.use('/api/workflows', workflowRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'workflow-engine', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`✓ Workflow Engine running on port ${PORT}`);
});

export default app;

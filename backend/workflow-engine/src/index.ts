import express from 'express';
import cors from 'cors';
import workflowRoutes from './routes/workflows';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/api/workflows', workflowRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'workflow-engine', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Workflow Engine running on port ${PORT}`);
});

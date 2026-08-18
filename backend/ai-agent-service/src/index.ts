import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agents';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use('/api/agents', agentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-agent', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AI Agent Service running on port ${PORT}`);
});

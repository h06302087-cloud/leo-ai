import express from 'express';
import cors from 'cors';
import integrationRoutes from './routes/integrations';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/api/integrations', integrationRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'integration', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Integration Service running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import exportRoutes from './routes/export';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use('/api/export', exportRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'export', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Export Service running on port ${PORT}`);
});

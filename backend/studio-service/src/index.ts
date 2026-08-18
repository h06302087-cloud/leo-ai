import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import studioRoutes from './routes/studio';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/studio', studioRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'studio', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Studio Service running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const connectDB = require('./config/db');
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Central API router to keep future route registration organized.
const apiRouter = express.Router();
app.use('/api', apiRouter);
app.use('/api/workouts', workoutRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require("cors");
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path'); 
const dashboardRoutes = require('./routes/dashboardRoutes')
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes'); 
const workspaceRoutes = require("./routes/workspaceRoutes");
const RecentlyOpenedRoutes = require("./routes/RecentlyOpened")
const app = express();
app.use(cors());
app.use(express.json());
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));

app.use(express.json({ limit: '10mb' }));
app.use(`/api/${API_VERSION}/uploads`, express.static(path.join(__dirname, 'uploads')));

//Connect db
const db = require('./config/db');
db.connect()

// Routes
app.use(`/api/${API_VERSION}/users`, require('./routes/userRoutes'));
app.use(`/api/${API_VERSION}/auth`, require('./routes/authRoutes'));
app.use(`/api/${API_VERSION}/folders`, folderRoutes);
app.use(`/api/${API_VERSION}/files`, fileRoutes);
app.use(`/api/${API_VERSION}/workspaces`, require("./routes/workspaceRoutes"));
app.use(`/api/${API_VERSION}/recently-opened`, RecentlyOpenedRoutes)
app.use(`/api/${API_VERSION}/share`, fileRoutes);
app.use(`/api/${API_VERSION}/folders/:id/files`, async (req,res) => {
  const folderId = req.params.id;
  const files = await File.find({folderId})
  res.json(files)
})



// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Example app listening on port http://${host}:${port}`);
})

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Route dashboard
app.use('/api/v1/dashboard', dashboardRoutes)
require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require("cors");

const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
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
app.use("/uploads", express.static("uploads"));

//Connect db
const db = require('./config/db');
db.connect()

app.use(express.static(path.join(__dirname, 'public')))

//Template engine
app.engine('hbs', engine({
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'))

// Routes
app.use(`/api/${API_VERSION}/users`, require('./routes/userRoutes'));
app.use(`/api/${API_VERSION}/auth`, require('./routes/authRoutes'));

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Example app listening on port http://localhost:${port}`);
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
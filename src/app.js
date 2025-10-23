import express from 'express';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/site.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

export default app;

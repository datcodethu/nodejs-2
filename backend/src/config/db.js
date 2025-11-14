const mongoose = require('mongoose')
const logger = require('../utils/logger')

const mongoURL = process.env.MONGODB_URI  // ✅ phải khớp với .env

async function connect() {
    try {
        if (!mongoURL) {
            throw new Error('MONGODB_URI is not defined in environment variables')
        }

        await mongoose.connect(mongoURL, {
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error', error)
        process.exit(1)
    }
}

module.exports = { connect }

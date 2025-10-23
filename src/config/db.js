const mongoose = require('mongoose')
const logger = require('../utils/logger')

const mongoURL = process.env.MONGO_URL

async function connect(){
    try {
        await mongoose.connect(mongoURL, {
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error', error)
    }
}

module.exports = { connect }
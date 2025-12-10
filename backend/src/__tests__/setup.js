/**
 * Test Setup & Database Connection Utilities
 * Cung cấp hàm giúp setup/teardown test environment
 */

process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Kết nối tới In-Memory MongoDB cho testing
 */
async function connectTestDB() {
  try {
    // Tắt kết nối cũ nếu có
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Tạo in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Failed to connect test database:', error);
    throw error;
  }
}

/**
 * Ngắt kết nối test database
 */
async function disconnectTestDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('✅ Disconnected from test database');
  } catch (error) {
    console.error('❌ Failed to disconnect test database:', error);
    throw error;
  }
}

/**
 * Xóa sạch tất cả collections trong test database
 */
async function clearDB() {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('✅ Cleared all collections');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    throw error;
  }
}

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearDB,
};

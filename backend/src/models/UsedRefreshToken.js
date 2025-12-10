const mongoose = require('mongoose');

const UsedRefreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    deviceId: {
        type: String,
        required: true,
        // same deviceId as the rotated token
        index: true
    },
    usedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
}, { timestamps: false }); // We control timestamps ourselves

// Auto-remove after expiry via TTL index
UsedRefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsedRefreshToken = mongoose.model('used_refresh_token', UsedRefreshTokenSchema);

module.exports = UsedRefreshToken;

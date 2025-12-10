const crypto = require('crypto');

/**
 * Generate a unique deviceId from User-Agent header
 * Same device (same User-Agent) will always produce the same deviceId
 * @param {string} userAgent - The User-Agent header string
 * @returns {string} - A consistent device identifier (SHA256 hash)
 */
function generateDeviceId(userAgent) {
    if (!userAgent) {
        // Fallback for requests without User-Agent
        return crypto.randomBytes(16).toString('hex');
    }
    
    return crypto
        .createHash('sha256')
        .update(userAgent)
        .digest('hex');
}

module.exports = { generateDeviceId };

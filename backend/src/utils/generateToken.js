    require('dotenv').config();
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const RefreshToken = require('../models/RefreshToken');

    /**
     * Generate access token and refresh token for a user on a specific device
     * 
     * Access Token:
     *   - JWT with sub (user ID), jti (unique ID), role, exp (15m)
     *   - Used for API requests via Authorization header
     * 
     * Refresh Token:
     *   - Random 64-byte hex string
     *   - Stored in DB with deviceId and expiresAt (7 days)
     *   - Stored in httpOnly cookie
     * 
     * @param {Object} user - User document with _id, role
     * @param {string} deviceId - Device identifier (hash of User-Agent)
     * @returns {Promise<{accessToken, refreshToken, expiresIn}>} - Token pair
     */
    async function generateToken(user, deviceId) {
        // ===== Access Token (JWT) =====
        const accessTokenPayload = {
            sub: user._id.toString(), // subject (user ID) - standard JWT claim
            jti: crypto.randomUUID(),  // unique token ID - prevents token reuse
            role: user.role,
            iat: Math.floor(Date.now() / 1000), // issued at - ensures freshness
        };

        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // ===== Refresh Token (Random Bytes) =====
        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Save refresh token to database
        const refreshTokenRecord = await RefreshToken.create({
            userId: user._id,
            token: refreshTokenValue,
            deviceId: deviceId,
            expiresAt: expiresAt,
            createdAt: new Date()
        });

        if (!refreshTokenRecord) {
            throw new Error('Failed to save refresh token to database');
        }

        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: '15m'
        };
    }

    module.exports = generateToken;
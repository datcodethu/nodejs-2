const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Validate access token in Authorization header
 * 
 * Expected format: "Authorization: Bearer <JWT>"
 * 
 * Returns:
 *   401 → Missing or invalid Authorization header format
 *   401 → Token expired or invalid signature
 *   401 → User not found (token claims valid but user deleted)
 *   200 → Token valid, user found, proceeds to next middleware
 * 
 * Sets req.user with user info from token
 */
const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // ===== Validate Authorization header format =====
        if (!authHeader) {
            logger.warn('Authorization header not provided');
            return res.status(401).json({
                success: false,
                message: 'Authorization header is required'
            });
        }

        // Must start with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            logger.warn('Authorization header does not start with "Bearer"');
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization header format'
            });
        }

        // Extract token after "Bearer "
        const token = authHeader.slice(7);

        // ===== Verify JWT signature and expiration =====
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                logger.warn(`Token expired at: ${jwtError.expiredAt}`);
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }
            logger.warn(`Token verification failed: ${jwtError.message}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // ===== Extract user ID from token (sub claim per JWT standard) =====
        const userId = decoded.sub;
        if (!userId) {
            logger.warn('Token missing required sub claim');
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // ===== Verify user still exists =====
        const user = await User.findById(userId).select('_id name email role');

        if (!user) {
            logger.warn(`User not found for ID: ${userId}`);
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // ===== Token valid: attach user to request =====
        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            jti: decoded.jti  // Token ID for advanced use cases
        };

        logger.info(`Access token validated for user: ${req.user._id}`);
        next();

    } catch (error) {
        logger.error(`Unexpected error in validateToken: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    validateToken
};
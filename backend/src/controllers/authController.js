const logger = require('../utils/logger');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateDeviceId } = require('../utils/deviceId');
const { validationRegistration, validationLogin } = require('../validation/authValidation');
const RefreshToken = require('../models/RefreshToken');
const UsedRefreshToken = require('../models/UsedRefreshToken');

/**
 * Cookie options for refresh token
 * - httpOnly: prevents XSS attacks (JS cannot read cookie)
 * - secure: HTTPS only in production
 * - sameSite: prevents CSRF attacks
 * - path: cookie sent to all paths
 * - maxAge: 7 days (same as token TTL)
 */
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

/**
 * POST /auth/register
 */
const registerUser = async (req, res) => {
    try {
        logger.info('Registering new user...');
        const { error } = validationRegistration(req.body);

        if (error) {
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            logger.warn(`User already exists with email: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        user = new User({
            email,
            password
        });

        await user.save();
        logger.info(`User registered successfully: ${user._id}`);

        // Generate tokens for first device
        const deviceId = generateDeviceId(req.body.deviceId || req.headers['x-device-id'] || 'default-device');
        const { accessToken, refreshToken } = await generateToken(user, deviceId);

        // Set refresh token in secure HTTP-only cookie
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    email: user.email
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        logger.error(`Error during user registration: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


// POST /auth/login
const loginUser = async (req, res) => {
    try {
        logger.info('User login attempt...');
        const { error } = validationLogin(req.body);

        if (error) {
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        // console.log(u)
        logger.info(`Login attempt for email: ${email}`);

        if (!user) {
            logger.warn(`Login failed: user not found for email ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            logger.warn(`Login failed: invalid password for ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        logger.info(`User logged in successfully: ${user._id}`);

        // Generate device ID from User-Agent (same device = same deviceId)
        const deviceId = generateDeviceId(req.body.deviceId || req.headers['x-device-id'] || 'default-device');

        // Delete old token for this device (one token per device)
        // This prevents accumulating tokens when user logs in multiple times from same device
        await RefreshToken.deleteOne({ userId: user._id, deviceId });

        // Generate new tokens for this device
        const { accessToken, refreshToken } = await generateToken(user, deviceId);
        // Set refresh token in secure HTTP-only cookie
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        logger.error(`Error during user login: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



// POST /auth/refresh
const refreshToken = async (req, res) => {
    try {
        logger.info('Refreshing access token...');
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is required' });
        }

        const tokenRecord = await RefreshToken.findOne({ token: oldRefreshToken });

        if (!tokenRecord) {
            const usedRecord = await UsedRefreshToken.findOne({ token: oldRefreshToken });
            if (usedRecord) {
                logger.warn(`⚠️ TOKEN REUSE DETECTED for user: ${usedRecord.userId}`);
                await RefreshToken.deleteMany({ userId: usedRecord.userId });
                return res.status(401).json({ success: false, message: 'Refresh token is invalid' });
            }
            return res.status(401).json({ success: false, message: 'Refresh token is invalid' });
        }

        if (tokenRecord.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: tokenRecord._id });
            return res.status(401).json({ success: false, message: 'Refresh token is invalid' });
        }

        const user = await User.findById(tokenRecord.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Refresh token is invalid' });
        }

        try {
            await UsedRefreshToken.create({
                userId: tokenRecord.userId,
                token: oldRefreshToken,
                deviceId: tokenRecord.deviceId,
                usedAt: new Date(),
                expiresAt: tokenRecord.expiresAt
            });
        } catch (e) {
        }

        await RefreshToken.deleteOne({ _id: tokenRecord._id });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(
            user,
            tokenRecord.deviceId
        );

        res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        logger.error(`Error during token refresh: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// POST /auth/logout
 
const logoutUser = async (req, res) => {
    try {
        logger.info('User logout attempt...');

        let refreshToken = req.body.refreshToken;
        
        // If not in body, try to get from cookie
        if (!refreshToken && req.cookies.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        }

        if (!refreshToken) {
            logger.warn('Logout attempted without refresh token');
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Delete the refresh token from active tokens (this device)
        const result = await RefreshToken.deleteOne({ token: refreshToken });

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', COOKIE_OPTIONS);

        logger.info(`Logout successful`);

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });

    } catch (error) {
        logger.error(`Error during user logout: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};
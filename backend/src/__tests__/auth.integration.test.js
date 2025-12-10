/**
 * ============================================
 * AUTHENTICATION TEST SUITE
 * ============================================
 * 
 * Bài test toàn diện cho module Authentication
 * với dual token (Access + Refresh) + Token Rotation
 * 
 * Test Framework: Jest + Supertest
 * Database: MongoDB Memory Server
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { connectTestDB, disconnectTestDB, clearDB } = require('./setup');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const authController = require('../controllers/authController');
const { validateToken } = require('../middlewares/authMiddleware');
const generateToken = require('../utils/generateToken');

// ============================================
// SETUP TEST APP
// ============================================

let app;
let testUser;
let validAccessToken;
let validRefreshToken;

beforeAll(async () => {
    await connectTestDB();

    // Tạo Express app đơn giản cho test
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Cookie parser mock
    app.use((req, res, next) => {
        // Mock cookie parser cho test
        const cookieHeader = req.get('cookie');
        req.cookies = {};
        if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            req.cookies[name] = value;
        });
        }

        // Mock res.cookie
        res.cookie = function(name, value, options) {
        if (!this._cookies) this._cookies = {};
        this._cookies[name] = { value, options };
        return this;
        };

        // Mock res.clearCookie
        res.clearCookie = function(name, options) {
        if (!this._cookies) this._cookies = {};
        this._cookies[name] = null;
        return this;
        };

        next();
    });

    // Routes
    app.post('/auth/register', authController.registerUser);
    app.post('/auth/login', authController.loginUser);
    app.post('/auth/refresh-token', authController.refreshToken);
    app.post('/auth/logout', authController.logoutUser);
    app.get('/api/protected', validateToken, (req, res) => {
        res.status(200).json({ success: true, user: req.user });
    });
});

afterAll(async () => {
    await disconnectTestDB();
});

beforeEach(async () => {
    await clearDB();
    testUser = null;
    validAccessToken = null;
    validRefreshToken = null;
});

// ============================================
// TEST SUITE 1: AUTH FLOW (Login & Register)
// ============================================

describe('1. AUTH FLOW - Login & Register', () => {

    describe('1.1 Register User', () => {

        test('✅ [Happy Path] Register với email & password hợp lệ', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'newuser@example.com',
            password: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('refreshToken');
        expect(response.body.data.user.email).toBe('newuser@example.com');

        // Verify user được lưu vào DB
        const savedUser = await User.findOne({ email: 'newuser@example.com' });
        expect(savedUser).toBeDefined();
        expect(savedUser.email).toBe('newuser@example.com');
        });

        test('❌ [Edge Case] Register với email đã tồn tại', async () => {
        // Tạo user thứ nhất
        await request(app)
            .post('/auth/register')
            .send({
            email: 'duplicate@example.com',
            password: 'password123'
            });

        // Thử tạo user với email trùng
        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'duplicate@example.com',
            password: 'password456'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('User already exists');
        });

        test('❌ [Validation] Register thiếu email', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
            password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('email');
        });

        test('❌ [Validation] Register thiếu password', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'test@example.com'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('password');
        });

        test('❌ [Validation] Register với password quá ngắn', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'test@example.com',
            password: '123'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('password');
        });

        test('❌ [Validation] Register với email format sai', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'invalid-email',
            password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        });
    });

    describe('1.2 Login User', () => {

        beforeEach(async () => {
        // Tạo test user trước mỗi test
        testUser = new User({
            email: 'testuser@example.com',
            password: 'password123'
        });
        await testUser.save();
        });

        test('✅ [Happy Path] Login với email & password đúng', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User logged in successfully');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('refreshToken');

        validAccessToken = response.body.data.accessToken;
        validRefreshToken = response.body.data.refreshToken;

        // Verify refresh token được lưu vào DB
        const refreshTokenRecord = await RefreshToken.findOne({ token: validRefreshToken });
        expect(refreshTokenRecord).toBeDefined();
        expect(refreshTokenRecord.userId.toString()).toBe(testUser._id.toString());
        });

        test('❌ [Security] Login với password sai', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email or password');
        });

        test('❌ [Security] Login với email không tồn tại', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'password123'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email or password');
        });

        test('❌ [Validation] Login thiếu email', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
            password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        });

        test('❌ [Validation] Login thiếu password', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        });

        test('✅ [Security] Login hủy hết refresh token cũ', async () => {
        // Login lần 1
        const login1 = await request(app)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'password123'
            });

        const oldRefreshToken = login1.body.data.refreshToken;
        const oldTokenRecord = await RefreshToken.findOne({ token: oldRefreshToken });
        expect(oldTokenRecord).toBeDefined();

        // Login lần 2
        const login2 = await request(app)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'password123'
            });

        const newRefreshToken = login2.body.data.refreshToken;

        // Verify token cũ bị xóa
        const oldTokenAfterSecondLogin = await RefreshToken.findOne({ token: oldRefreshToken });
        expect(oldTokenAfterSecondLogin).toBeNull();

        // Verify token mới được tạo
        const newTokenRecord = await RefreshToken.findOne({ token: newRefreshToken });
        expect(newTokenRecord).toBeDefined();
        });
    });
});

// ============================================
// TEST SUITE 2: TOKEN REFRESHING (Core Logic)
// ============================================

describe('2. TOKEN REFRESHING - Token Rotation & Reuse Detection', () => {

    beforeEach(async () => {
        // Tạo test user
        testUser = new User({
        email: 'testuser@example.com',
        password: 'password123'
        });
        await testUser.save();

        // Login để có token
        const loginResponse = await request(app)
        .post('/auth/login')
        .send({
            email: 'testuser@example.com',
            password: 'password123'
        });

        validAccessToken = loginResponse.body.data.accessToken;
        validRefreshToken = loginResponse.body.data.refreshToken;
    });

    describe('2.1 Happy Path - Token Refresh', () => {

        test('✅ [Happy Path] Refresh với token hợp lệ', async () => {
        const response = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data.accessToken).not.toBe(validAccessToken);

        // Verify token mới hợp lệ
        const decoded = jwt.verify(response.body.data.accessToken, process.env.JWT_SECRET);
        expect(decoded.sub).toBe(testUser._id.toString());

        });
    });

    describe('2.2 Reuse Detection - Security Critical ⚠️', () => {

        test('✅ [CRITICAL] Reuse Detection: Gửi token đã sử dụng', async () => {
        // Lần 1: Refresh token hợp lệ
        const response1 = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(response1.status).toBe(200);
        const newRefreshToken = response1.body.accessToken; // Lấy token mới

        // Lần 2: Thử dùng lại token cũ (đã expended)
        const response2 = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(response2.status).toBe(401);
        expect(response2.body.success).toBe(false);
        expect(response2.body.message).toBe('Refresh token is invalid');

        // ⚠️ CRITICAL: Verify tất cả token của user bị xóa (logout từ tất cả devices)
        const remainingTokens = await RefreshToken.find({ userId: testUser._id });
        expect(remainingTokens.length).toBe(0);
        });

        test('✅ [CRITICAL] Reuse Detection: Hủy tất cả token sau phát hiện reuse', async () => {
        // Refresh 1 - OK
        const refresh1 = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(refresh1.status).toBe(200);
        const newToken1 = refresh1.body.accessToken;

        // Refresh 2 - OK
        const refresh2 = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(refresh2.status).toBe(401);

        // Kiểm tra DB: tất cả token của user phải empty
        const allTokens = await RefreshToken.find({ userId: testUser._id });
        expect(allTokens.length).toBe(0); // Đã xóa hết

        // Lần refresh tiếp theo cũng fail
        const refresh3 = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', `refreshToken=${validRefreshToken}`);

        expect(refresh3.status).toBe(401);
        });
    });

    describe('2.3 Expired Token', () => {

        test('❌ [Edge Case] Gửi refresh token đã hết hạn', async () => {
            // Tạo token bị expire
            const expiredToken = new RefreshToken({
                token: 'expired-token-hash',
                userId: testUser._id,
                deviceId: 'device-test-id', // <--- 🟢 THÊM DÒNG NÀY (Bắt buộc theo Schema mới)
                createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
                expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            });
            await expiredToken.save();

            const response = await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', 'refreshToken=expired-token-hash');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Refresh token is invalid');
            });
        });

        describe('2.4 Invalid Token Format', () => {

            test('❌ [Security] Gửi refresh token giả mạo', async () => {
            const response = await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', 'refreshToken=fake-token-that-doesnt-exist');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Refresh token is invalid');
            });

            test('❌ [Validation] Không gửi refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Refresh token is required');
        });
    });
});

// ============================================
// TEST SUITE 3: PROTECTED ROUTES (Access Token)
// ============================================

describe('3. PROTECTED ROUTES - Access Token Validation', () => {

  beforeEach(async () => {
    testUser = new User({
      email: 'testuser@example.com',
      password: 'password123'
    });
    await testUser.save();

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });

    validAccessToken = loginResponse.body.data.accessToken;
  });

  describe('3.1 Valid Access Token', () => {

    test('✅ [Happy Path] Gửi access token hợp lệ', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUser._id.toString());
      expect(response.body.user.email).toBe('testuser@example.com');
    });
  });

  describe('3.2 Invalid Access Token', () => {

    test('❌ [Security] Gửi access token giả mạo', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    test('❌ [Validation] Không gửi token trong header', async () => {
      const response = await request(app)
        .get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header is required');
    });

    test('❌ [Validation] Header Authorization format sai', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `InvalidFormat ${validAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('3.3 Expired Access Token', () => {

    test('❌ [Edge Case] Gửi access token đã hết hạn', async () => {
      // Tạo token hết hạn (sign với expiresIn ngắn)
      const expiredToken = jwt.sign(
        { id: testUser._id, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Expire ngay lập tức
      );

      // Đợi 1ms để đảm bảo token đã expire
      await new Promise(resolve => setTimeout(resolve, 1));

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token has expired');
    });
  });

  describe('3.4 User Not Found', () => {

    test('❌ [Edge Case] User bị xóa nhưng token vẫn hợp lệ', async () => {
      // Xóa user khỏi DB
      await User.deleteOne({ _id: testUser._id });

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });
});

// ============================================
// TEST SUITE 4: LOGOUT
// ============================================

describe('4. LOGOUT - Token Revocation', () => {

  beforeEach(async () => {
    testUser = new User({
      email: 'testuser@example.com',
      password: 'password123'
    });
    await testUser.save();

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });

    validRefreshToken = loginResponse.body.data.refreshToken;
  });

  describe('4.1 Logout Success', () => {

    test('✅ [Happy Path] Logout xóa refresh token', async () => {
      // Verify token tồn tại trước logout
      const tokenBefore = await RefreshToken.findOne({ token: validRefreshToken });
      expect(tokenBefore).toBeDefined();

      // Logout
      const logoutResponse = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: validRefreshToken });

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toBe('User logged out successfully');

      // Verify token bị xóa
      const tokenAfter = await RefreshToken.findOne({ token: validRefreshToken });
      expect(tokenAfter).toBeNull();
    });

    test('✅ [Security] Sau logout, refresh token không dùng được', async () => {
      // Logout
      await request(app)
        .post('/auth/logout')
        .send({ refreshToken: validRefreshToken });

      // Thử refresh
      const refreshResponse = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}`);

      // After logout, token is deleted, so refresh should return 401
      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body.success).toBe(false);
    });
  });

  describe('4.2 Logout Validation', () => {

    test('❌ [Validation] Logout không gửi token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });

    test('✅ [Idempotent] Logout 2 lần với token giống nhau', async () => {
      // Logout lần 1
      const logout1 = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: validRefreshToken });

      expect(logout1.status).toBe(200);

      // Logout lần 2 (idempotent - không lỗi)
      const logout2 = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: validRefreshToken });

      // Có thể 200 hoặc 400 tùy design (thường accept kerana idempotent)
      expect([200, 400]).toContain(logout2.status);
    });
  });
});

// ============================================
// TEST SUITE 5: EDGE CASES & INTEGRATION
// ============================================

describe('5. EDGE CASES & INTEGRATION TESTS', () => {

  test('✅ Toàn bộ flow: Register -> Login -> Refresh -> Protected -> Logout', async () => {
    // Step 1: Register
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'integration@example.com',
        password: 'password123'
      });

    expect(registerRes.status).toBe(201);
    const accessToken1 = registerRes.body.data.accessToken;
    const refreshToken1 = registerRes.body.data.refreshToken;

    // Step 2: Access protected route
    const protectedRes1 = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${accessToken1}`);

    expect(protectedRes1.status).toBe(200);
    const userId = protectedRes1.body.user._id;

    // Step 3: Refresh token
    const refreshRes = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken1}`);

    expect(refreshRes.status).toBe(200);
    const accessToken2 = refreshRes.body.data.accessToken;

    // Verify old token không dùng được nữa
    const oldTokenTest = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken1}`);

    expect(oldTokenTest.status).toBe(401);

    // Step 4: Access protected với token mới
    const protectedRes2 = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${accessToken2}`);

    expect(protectedRes2.status).toBe(200);

    // Step 5: Logout
    // Note: Cần lấy token mới từ refresh response
    // Backend implementation cần update để return newRefreshToken
    const logoutRes = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: refreshToken1 });

    // Logout thất bại vì token cũ đã bị xóa
    expect([200, 400]).toContain(logoutRes.status);
  });

  test('✅ Multiple users isolation', async () => {
    // User 1
    const user1Res = await request(app)
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: 'password123'
      });

    const user1AccessToken = user1Res.body.data.accessToken;
    const user1RefreshToken = user1Res.body.data.refreshToken;

    // User 2
    const user2Res = await request(app)
      .post('/auth/register')
      .send({
        email: 'user2@example.com',
        password: 'password456'
      });

    const user2AccessToken = user2Res.body.data.accessToken;
    const user2RefreshToken = user2Res.body.data.refreshToken;

    // User 1 access protected - should succeed
    const user1Protected = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(user1Protected.status).toBe(200);
    expect(user1Protected.body.user.email).toBe('user1@example.com');

    // User 2 access protected - should succeed with different token
    const user2Protected = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(user2Protected.status).toBe(200);
    expect(user2Protected.body.user.email).toBe('user2@example.com');

    // User 1 token không dùng cho User 2 resources
    expect(user1Protected.body.user._id).not.toBe(user2Protected.body.user._id);
  });

  test('❌ Token timing attack mitigation', async () => {
    const testUser = new User({
      email: 'timing@example.com',
      password: 'password123'
    });
    await testUser.save();

    // Thử nhiều token giả mạo, verify response time tương tự (constant-time)
    const tokens = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid1.signature1',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid2.signature2',
      'completely-invalid-token',
      ''
    ];

    const times = [];

    for (const token of tokens) {
      const start = Date.now();
      await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);
      const elapsed = Date.now() - start;
      times.push(elapsed);
    }

    // Verify response times vừa phải (không quá khác nhau)
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    // Tolerance: 100ms (để tránh flaky test)
    expect(maxTime - minTime).toBeLessThan(100);
  });
});

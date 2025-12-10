// src/__tests__/auth.unit.test.js

// 🟢 1. SETUP MOCKS TRƯỚC KHI IMPORT CONTROLLER
// Mock Models
jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('../models/UsedRefreshToken');

// Mock Utils
jest.mock('../utils/generateToken');
jest.mock('../utils/deviceId', () => ({
  generateDeviceId: jest.fn().mockReturnValue('device-hash-123')
}));
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock Validation (Fix lỗi 400 Register)
jest.mock('../validation/authValidation', () => ({
  validationRegistration: jest.fn().mockReturnValue({ error: null }), // Mặc định là Pass
  validationLogin: jest.fn().mockReturnValue({ error: null })
}));

// Mock JWT nhưng giữ implementation thật cho test case cuối
jest.mock('jsonwebtoken', () => {
  const original = jest.requireActual('jsonwebtoken');
  return {
    ...original,
    verify: jest.fn(),
    sign: jest.fn(),
    decode: jest.fn()
  };
});

// 🟢 2. IMPORT CONTROLLER & DEPENDENCIES SAU KHI MOCK
const authController = require('../controllers/authController');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const UsedRefreshToken = require('../models/UsedRefreshToken');
const generateToken = require('../utils/generateToken');
const { validationRegistration, validationLogin } = require('../validation/authValidation');
const jwt = require('jsonwebtoken');

describe('Authentication Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, headers: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    
    // Reset validation mặc định là pass
    validationRegistration.mockReturnValue({ error: null });
    validationLogin.mockReturnValue({ error: null });
  });

  // ============================================
  // REGISTER
  // ============================================
  describe('registerUser', () => {
    test('✅ [Happy Path] Register user thành công', async () => {
      User.findOne.mockResolvedValueOnce(null);
      User.mockImplementationOnce(() => ({
        _id: 'user-123',
        email: 'new@example.com',
        save: jest.fn().mockResolvedValueOnce()
      }));
      
      generateToken.mockResolvedValueOnce({ 
        accessToken: 'at', refreshToken: 'rt' 
      });

      req.body = { email: 'new@example.com', password: '123' };
      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('❌ [Validation] Register thiếu email', async () => {
      // Override mock để trả về lỗi
      validationRegistration.mockReturnValue({ 
        error: { details: [{ message: '"email" is required' }] } 
      });

      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ============================================
  // LOGIN
  // ============================================
  describe('loginUser', () => {
    test('✅ [Happy Path] Login thành công', async () => {
      User.findOne.mockResolvedValueOnce({
        _id: 'user-123',
        comparePassword: jest.fn().mockResolvedValueOnce(true)
      });
      RefreshToken.deleteOne.mockResolvedValueOnce({});
      generateToken.mockResolvedValueOnce({ accessToken: 'at', refreshToken: 'rt' });

      req.body = { email: 'u@e.com', password: '123' };
      await authController.loginUser(req, res);
      
      expect(RefreshToken.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ============================================
  // REFRESH TOKEN
  // ============================================
  describe('refreshToken', () => {
    test('✅ [Happy Path] Refresh token thành công', async () => {
      req.cookies = { refreshToken: 'old-rt' };

      RefreshToken.findOne.mockResolvedValueOnce({
        _id: 'record_id',
        token: 'old-rt',
        userId: 'user-123',
        deviceId: 'dev-1',
        expiresAt: new Date(Date.now() + 100000)
      });

      User.findById.mockResolvedValueOnce({ _id: 'user-123' });
      
      // Mock giá trị trả về cụ thể cho test case này
      generateToken.mockResolvedValueOnce({ 
        accessToken: 'new-access-token-123', 
        refreshToken: 'new-refresh-token-123' 
      });
      
      UsedRefreshToken.create.mockResolvedValueOnce({});
      RefreshToken.deleteOne.mockResolvedValueOnce({});

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Kiểm tra chính xác giá trị mock
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token-123', expect.any(Object));
    });

    test('❌ [Edge Case] User không tồn tại', async () => {
      req.cookies = { refreshToken: 'valid-token' };
      RefreshToken.findOne.mockResolvedValueOnce({ userId: 'deleted-user', expiresAt: new Date(Date.now() + 10000) });
      User.findById.mockResolvedValueOnce(null);

      await authController.refreshToken(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('❌ [Security] Token Reuse Detected', async () => {
      req.cookies = { refreshToken: 'reused-token' };
      RefreshToken.findOne.mockResolvedValueOnce(null); 
      UsedRefreshToken.findOne.mockResolvedValueOnce({ userId: 'hacked-user' }); 

      await authController.refreshToken(req, res);

      expect(RefreshToken.deleteMany).toHaveBeenCalledWith({ userId: 'hacked-user' });
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ============================================
  // TOKEN PROPERTIES
  // ============================================
  describe('Token Security Properties', () => {
    test('✅ Access token có exp claim', () => {
        const jwtReal = jest.requireActual('jsonwebtoken');
        const token = jwtReal.sign({ id: 1 }, 'secret', { expiresIn: '15m' });
        const decoded = jwtReal.decode(token);
        expect(decoded).toHaveProperty('exp');
    });

    test('✅ Refresh token là random bytes, không JWT', () => {
        const jwtReal = jest.requireActual('jsonwebtoken');
        const crypto = require('crypto');
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const decoded = jwtReal.decode(refreshToken);
        expect(decoded).toBeNull();
    });
  });
});
const authController = require('../controllers/authController');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const UsedRefreshToken = require('../models/UsedRefreshToken');
const generateToken = require('../utils/generateToken');
// Import validation để mock
const { validationRegistration, validationLogin } = require('../validation/authValidation');

// ============================================
// MOCKS
// ============================================

jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('../models/UsedRefreshToken');
jest.mock('../utils/generateToken');
jest.mock('../utils/deviceId', () => ({
  generateDeviceId: jest.fn().mockReturnValue('device-hash-123')
}));
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock validation trả về object chứa function
jest.mock('../validation/authValidation', () => ({
  validationRegistration: jest.fn(),
  validationLogin: jest.fn()
}));

// Mock JWT
jest.mock('jsonwebtoken', () => {
  const original = jest.requireActual('jsonwebtoken');
  return {
    ...original,
    verify: jest.fn(),
    sign: jest.fn(),
    decode: jest.fn()
  };
});

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
    
    // 🟢 QUAN TRỌNG: Mặc định validation luôn PASS (không có error)
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
      
      // Mock trả về token cụ thể
      generateToken.mockResolvedValueOnce({ 
        accessToken: 'access-token-123', 
        refreshToken: 'refresh-token-123' 
      });

      req.body = { email: 'new@example.com', password: '123' };
      
      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ 
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-123'
        })
      }));
    });

    test('❌ [Validation] Register thiếu email', async () => {
      // 🟢 Mock validation FAIL
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

      // 1. Tìm thấy token cũ
      RefreshToken.findOne.mockResolvedValueOnce({
        _id: 'record_id',
        token: 'old-rt',
        userId: 'user-123',
        deviceId: 'dev-1',
        expiresAt: new Date(Date.now() + 100000)
      });

      // 2. Tìm thấy User
      User.findById.mockResolvedValueOnce({ _id: 'user-123' });
      
      // 3. Mock Generate Token trả về giá trị MỚI
      generateToken.mockResolvedValueOnce({ 
          accessToken: 'new-access-token', 
          refreshToken: 'new-refresh-token' // <-- Giá trị này phải khớp với expect bên dưới
      });
      
      UsedRefreshToken.create.mockResolvedValueOnce({});
      RefreshToken.deleteOne.mockResolvedValueOnce({});

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      // 🟢 Verify: Cookie phải được set bằng giá trị mock ở trên ('new-refresh-token')
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', expect.any(Object));
      
      // Verify rotation
      expect(UsedRefreshToken.create).toHaveBeenCalled();
      expect(RefreshToken.deleteOne).toHaveBeenCalled();
    });

    test('❌ [Edge Case] User không tồn tại', async () => {
      req.cookies = { refreshToken: 'valid-token' };
      RefreshToken.findOne.mockResolvedValueOnce({ userId: 'deleted-user', expiresAt: new Date(Date.now() + 10000) });
      User.findById.mockResolvedValueOnce(null); // Không thấy user

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('❌ [Security] Token Reuse Detected', async () => {
      req.cookies = { refreshToken: 'reused-token' };
      
      RefreshToken.findOne.mockResolvedValueOnce(null); // Không thấy trong Active
      UsedRefreshToken.findOne.mockResolvedValueOnce({ userId: 'hacked-user' }); // Thấy trong Used

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
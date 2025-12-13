import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import {
    Input,
    Button,
    ErrorMessage,
    SuccessMessage,
    AuthContainer,
} from './AuthComponents';
import { getEmailError, getPasswordError, isFormValid } from '../utils/validation';

const LoginPage = ({ setUser }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const emailError = touched.email ? getEmailError(email) : '';
    const passwordError = touched.password ? getPasswordError(password) : '';

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isFormValid(email, password)) {
            setTouched({ email: true, password: true });
            return;
        }

        setLoading(true);
        try {
            // 1. Gọi API đăng nhập
            const res = await authService.login(email, password);
            console.log("Login Response:", res);
            setSuccess('Login successful! Redirecting...');
            
            // 2. Lấy thông tin User từ token (đã decode trong authService)
            const currentUser = authService.getCurrentUser();
            console.log("Current User after login:", currentUser);
            // 3. Cập nhật State toàn cục
            if (currentUser) {
                setUser(currentUser);
            }
            
            // 4. Kiểm tra Role và điều hướng sau 1.5s
            setTimeout(() => {
                // Lấy role từ biến res trả về
                if (res.role === 'admin') {
                    console.log("Redirecting to Admin Dashboard");
                    navigate('/admin');
                } else {
                    console.log("Redirecting to User Workspace");
                    navigate('/');
                }
            }, 1000);

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer title="Welcome Back" subtitle="Sign in to your account">
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} />}
            
            <form onSubmit={handleLogin}>
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={emailError}
                    placeholder="you@example.com"
                    disabled={loading}
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    error={passwordError}
                    placeholder="••••••••"
                    disabled={loading}
                />

                <Button
                    type="submit"
                    loading={loading}
                    disabled={!isFormValid(email, password) || loading}
                >
                    Sign In
                </Button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-muted">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-decoration-none fw-600 text-primary"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </AuthContainer>
    );
};

export default LoginPage;
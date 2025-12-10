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
            await authService.login(email, password);
            setSuccess('Login successful! Redirecting...');
            
            // Cập nhật user state từ authService
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
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

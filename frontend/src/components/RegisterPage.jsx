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

const RegisterPage = ({ setUser }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState({ 
        email: false, 
        password: false, 
        confirmPassword: false 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const emailError = touched.email ? getEmailError(email) : '';
    const passwordError = touched.password ? getPasswordError(password) : '';
    const confirmPasswordError = touched.confirmPassword 
        ? !confirmPassword 
            ? 'Please confirm your password'
            : password !== confirmPassword 
            ? 'Passwords do not match'
            : ''
        : '';

    const isFormValid_ = 
        isFormValid(email, password) && 
        password === confirmPassword && 
        confirmPassword.length > 0;

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isFormValid_) {
            setTouched({ email: true, password: true, confirmPassword: true });
            return;
        }

        setLoading(true);
        try {
            await authService.register(email, password);
            setSuccess('Registration successful! Redirecting to dashboard...');
            
            // Cập nhật user state từ authService
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer title="Create Account" subtitle="Join us today">
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} />}
            
            <form onSubmit={handleRegister}>
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

                <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    error={confirmPasswordError}
                    placeholder="••••••••"
                    disabled={loading}
                />

                <Button
                    type="submit"
                    loading={loading}
                    disabled={!isFormValid_ || loading}
                >
                    Create Account
                </Button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-muted">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-decoration-none fw-600 text-primary"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthContainer>
    );
};

export default RegisterPage;

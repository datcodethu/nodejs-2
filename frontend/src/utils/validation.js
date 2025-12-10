export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password && password.length >= 6;
};

export const getEmailError = (email) => {
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email';
    return '';
};

export const getPasswordError = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
};

export const isFormValid = (email, password) => {
    return validateEmail(email) && validatePassword(password);
};

import React from 'react';

export const Input = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    disabled = false,
    placeholder = '',
    ...props 
}) => {
    return (
        <div className="mb-3">
            <label className="form-label fw-500">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                {...props}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export const Button = ({ 
    children, 
    loading = false, 
    disabled = false, 
    variant = 'primary',
    type = 'button',
    ...props 
}) => {
    return (
        <button
            type={type}
            disabled={loading || disabled}
            className={`btn btn-${variant} w-100 py-2 fw-600`}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Processing...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export const ErrorMessage = ({ message, onDismiss }) => {
    if (!message) return null;

    return (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <strong>Error!</strong> {message}
            {onDismiss && (
                <button
                    type="button"
                    className="btn-close"
                    onClick={onDismiss}
                    aria-label="Close"
                ></button>
            )}
        </div>
    );
};

export const SuccessMessage = ({ message, onDismiss }) => {
    if (!message) return null;

    return (
        <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <strong>Success!</strong> {message}
            {onDismiss && (
                <button
                    type="button"
                    className="btn-close"
                    onClick={onDismiss}
                    aria-label="Close"
                ></button>
            )}
        </div>
    );
};

export const AuthContainer = ({ children, title, subtitle }) => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="w-100" style={{ maxWidth: '450px' }}>
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <h1 className="h2 fw-700 mb-2">{title}</h1>
                            {subtitle && <p className="text-muted">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LoadingSpinner = () => {
    return (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

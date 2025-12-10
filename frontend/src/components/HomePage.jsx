import authService from '../services/authService';

const HomePage = () => {
    const user = authService.getCurrentUser() || {};

    const handleLogout = () => {
        authService.logout();
        // handleLogout trong authService sẽ tự redirect về /login
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa', paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body p-5">
                        <div className="row mb-4 align-items-center">
                            <div className="col-md-8">
                                <h1 className="h2 fw-700 mb-2">Welcome Back!</h1>
                                <p className="text-muted fs-5">
                                    {user.email ? `Logged in as ${user.email}` : 'You have successfully logged in.'}
                                </p>
                            </div>
                            <div className="col-md-4 text-md-end">
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-danger"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                        
                        <div className="row g-4 mt-2">
                            <div className="col-md-6">
                                <div className="card border-0 bg-light rounded-3 h-100">
                                    <div className="card-body">
                                        <h5 className="card-title fw-600">👤 Profile</h5>
                                        <p className="card-text text-muted">Your account is secure and ready to use.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="card border-0 bg-light rounded-3 h-100">
                                    <div className="card-body">
                                        <h5 className="card-title fw-600">📊 Dashboard</h5>
                                        <p className="card-text text-muted">Access your dashboard and manage your content.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

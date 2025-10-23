const authRolers = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have the required role.'
            })
        }
        next();
    }
}

module.exports = authRolers;
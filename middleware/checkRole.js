export const checkRole = (...roles) => async (req, res, next) => {
  if (roles.includes(req.user.role)) {
     next();
  } else {
     res.status(401).json({
        status: false,
        message: 'You are not a authorized user to access this resources'
     })
  }
}
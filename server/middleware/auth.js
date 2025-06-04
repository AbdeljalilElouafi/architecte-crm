const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET is not set")
      return res.status(500).json({ message: "Server configuration error" })
    }

    const decoded = jwt.verify(token, secret)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or inactive user" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({ message: "Invalid token" })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
}

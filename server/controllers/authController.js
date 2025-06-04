const jwt = require("jsonwebtoken")
const { User } = require("../models")

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" })
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ where: { email } })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  login,
  getProfile,
}

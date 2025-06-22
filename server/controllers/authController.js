const jwt = require("jsonwebtoken")
const { User } = require("../models")

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" })
}

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" })
    }

    
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, 
      role: role || "team_member",
      isActive: true, 
    })

    res.status(201).json({
      message: "Compte créé avec succès.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" })
    }

    const user = await User.findOne({ where: { email } })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Identifiants invalides" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants invalides" })
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
    res.status(500).json({ message: "Erreur interne du serveur" })
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
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import express, { json, urlencoded } from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error(" JWT_SECRET environment variable is required")
  process.exit(1)
}

if (!process.env.DB_NAME) {
  console.error(" DB_NAME environment variable is required")
  process.exit(1)
}

console.log(" Environment variables loaded:")
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Set" : " Missing")
console.log("- DB_NAME:", process.env.DB_NAME || " Missing")
console.log("- DB_HOST:", process.env.DB_HOST || "localhost")
console.log("- CLIENT_URL:", process.env.CLIENT_URL || "http://localhost:5173")

import { sequelize } from "./server/models/index.js";
import authRoutes from "./server/routes/auth.js";
import clientRoutes from "./server/routes/clients.js";
import projectRoutes from "./server/routes/projects.js";
import documentRoutes from "./server/routes/documents.js";
import paymentRoutes from "./server/routes/payments.js";
import dashboardRoutes from "./server/routes/dashboard.js";

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(json({ limit: "10mb" }))
app.use(urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET ? "Set" : "Missing",
      dbName: process.env.DB_NAME || "Missing",
    },
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log(" Database connection established successfully.")

    // Sync database (create tables)
    await sequelize.sync({ alter: true })
    console.log(" Database synchronized successfully.")

    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error(" Unable to start server:", error)
    process.exit(1)
  }
}

startServer()

export default app

const { sequelize, User, Client, Project, Document, Payment } = require("../server/models")
require("dotenv").config()

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true })
    console.log("Database synced successfully")

    // Create admin user
    const adminUser = await User.create({
      email: "admin@architect.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "architect",
    })

    // Create sample clients
    const clients = await Client.bulkCreate([
      {
        firstName: "Ahmed",
        lastName: "Benali",
        email: "ahmed.benali@email.com",
        phone: "+212 6 12 34 56 78",
        address: "123 Rue Mohammed V, Casablanca",
        cin: "AB123456",
        status: "active",
      },
      {
        firstName: "Fatima",
        lastName: "Alaoui",
        email: "fatima.alaoui@email.com",
        phone: "+212 6 87 65 43 21",
        address: "456 Avenue Hassan II, Rabat",
        cin: "CD789012",
        status: "active",
      },
      {
        firstName: "Omar",
        lastName: "Tazi",
        email: "omar.tazi@email.com",
        phone: "+212 6 11 22 33 44",
        address: "789 Boulevard Zerktouni, Marrakech",
        cin: "EF345678",
        status: "active",
      },
    ])

    // Create sample projects
    const projects = await Project.bulkCreate([
      {
        title: "Villa Moderne Casablanca",
        type: "new_build",
        description: "Construction d'une villa moderne de 300m²",
        status: "in_progress",
        startDate: new Date("2024-01-15"),
        totalPrice: 150000,
        location: "Casablanca",
        priority: "high",
        clientId: clients[0].id,
      },
      {
        title: "Rénovation Appartement Rabat",
        type: "renovation",
        description: "Rénovation complète d'un appartement de 120m²",
        status: "planning",
        startDate: new Date("2024-03-01"),
        totalPrice: 80000,
        location: "Rabat",
        priority: "medium",
        clientId: clients[1].id,
      },
      {
        title: "Extension Maison Marrakech",
        type: "extension",
        description: "Extension de 50m² avec terrasse",
        status: "completed",
        startDate: new Date("2023-10-01"),
        endDate: new Date("2024-01-30"),
        totalPrice: 60000,
        location: "Marrakech",
        priority: "low",
        clientId: clients[2].id,
      },
    ])

    // Create sample payments
    await Payment.bulkCreate([
      {
        amount: 50000,
        paymentDate: new Date("2024-01-20"),
        method: "bank_transfer",
        reference: "TRF001",
        notes: "Premier versement",
        status: "completed",
        projectId: projects[0].id,
      },
      {
        amount: 30000,
        paymentDate: new Date("2024-02-15"),
        method: "check",
        reference: "CHK001",
        notes: "Deuxième versement",
        status: "completed",
        projectId: projects[0].id,
      },
      {
        amount: 60000,
        paymentDate: new Date("2024-01-30"),
        method: "cash",
        reference: "CASH001",
        notes: "Paiement complet",
        status: "completed",
        projectId: projects[2].id,
      },
    ])

    console.log("Seed data created successfully!")
    console.log("Admin login: admin@architect.com / admin123")

    process.exit(0)
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
}

seedData()

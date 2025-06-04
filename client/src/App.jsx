import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth.jsx"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Clients from "./pages/Clients"
import Projects from "./pages/Projects"
import Documents from "./pages/Documents"
import Payments from "./pages/Payments"
import Settings from "./pages/Settings"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

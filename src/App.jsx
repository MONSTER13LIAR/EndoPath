import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import GridBackground from './components/GridBackground'
import DashboardLayout from './components/DashboardLayout'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Features from './pages/Features'
import Dashboard from './pages/Dashboard'
import EndoAI from './pages/EndoAI'

export default function App() {
  const location = useLocation()
  const noNavbarRoutes = ['/dashboard', '/endo-ai']
  const showNavbar = !noNavbarRoutes.includes(location.pathname)

  return (
    <>
      <GridBackground />
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/endo-ai" element={<EndoAI />} />
        </Route>
      </Routes>
    </>
  )
}

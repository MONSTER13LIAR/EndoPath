import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import GridBackground from './components/GridBackground'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Features from './pages/Features'

export default function App() {
  return (
    <>
      <GridBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
      </Routes>
    </>
  )
}

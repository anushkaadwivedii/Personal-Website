import { Route, Routes } from 'react-router'
import LandingPage from './pages/LandingPage'
import ClassicPortfolio from './pages/ClassicPortfolio'
import InteractiveCity from './pages/InteractiveCity'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portfolio" element={<ClassicPortfolio />} />
      <Route path="/city" element={<InteractiveCity />} />
    </Routes>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages (we'll create these next)
import Home from './pages/Home.jsx';
import TemperaturePage from './pages/TemperaturePage.jsx';
import FoodMassPage from './pages/FoodMassPage.jsx';
import BodySizePage from './pages/BodySizePage.jsx';
// You can add more pages later

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/temperature" element={<TemperaturePage />} />
        <Route path="/foodMass" element={<FoodMassPage />} />
        <Route path="/bodySize" element={<BodySizePage />} />
      </Routes>
    </Router>
  );
}

export default App;

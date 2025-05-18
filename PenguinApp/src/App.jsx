import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TemperaturePage from './pages/TemperaturePage';
import FoodMassPage from './pages/FoodMassPage';
import BodySizePage from './pages/BodySizePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/temperature" element={<TemperaturePage />} />
        <Route path="/foodmass" element={<FoodMassPage />} />
        <Route path="/bodysize" element={<BodySizePage />} />
      </Routes>
    </Router>
  );
}

export default App;

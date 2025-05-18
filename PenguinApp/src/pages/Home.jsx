import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [latest, setLatest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await axios.get('https://server-api-609n.onrender.com/latestOverview');
        setLatest(res.data);
      } catch (err) {
        console.error('Failed to fetch latest overview:', err);
      }
    }
    fetchLatest();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Penguin Data Dashboard</h1>

      {latest ? (
        <div style={{ margin: '20px auto', maxWidth: 600, textAlign: 'left' }}>
          <h3>Latest Readings</h3>
          <p><strong>Temperature:</strong> {latest.temperature}°C</p>
          <p><strong>Food Mass:</strong> {latest.foodMass} g</p>
          <p><strong>Body Size:</strong> {latest.bodySize} cm</p>
        </div>
      ) : (
        <p>Loading latest data...</p>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={() => navigate('/TemperaturePage')} style={btnStyle}>View Temperature</button>
        <button onClick={() => navigate('/FoodMassPage')} style={btnStyle}>View Food Mass</button>
        <button onClick={() => navigate('/BodySizePage')} style={btnStyle}>View Body Size</button>
      </div>
    </div>
  );
}

const btnStyle = {
  margin: '10px',
  padding: '10px 20px',
  fontSize: '16px',
  background: '#00aaff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default Home;

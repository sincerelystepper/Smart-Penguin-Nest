import { Link } from 'react-router-dom';

// Hide the flashing caret globally
const style = document.createElement('style');
style.innerHTML = `* { caret-color: transparent !important; }`;
document.head.appendChild(style);
import '../App.css';

export default function Home() {
  const buttonStyle = {
    width: '100%',
    backgroundColor: ' #0077cc',
    color: '#fff',
    border: 'none',
    padding: '10px 0',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h1>Welcome to Home Page</h1>
        <h3>Latest data</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '200px',
          alignItems: 'center', // Center the buttons horizontally
        }}>
          <Link to="/temperature" style={{ width: '100%' }}>
            <button className="animated-button" style={{ width: '100%' }}>Temperature Data</button>
          </Link>
          <Link to="/foodMass" style={{ width: '100%' }}>
            <button className="animated-button" style={{ width: '100%' }}>Go to Food Mass Page</button>
          </Link>
          <Link to="/bodySize" style={{ width: '100%' }}>
            <button className="animated-button" style={{ width: '100%' }}>Go to Body Size Page</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

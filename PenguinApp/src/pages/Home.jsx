import { Link } from 'react-router-dom';

export default function Home() {
  const buttonStyle = {
    width: '100%',
    backgroundColor: '#0077cc',
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
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h1>Welcome to Home Page</h1>
        <h3>Latest data</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px' }}>
          <Link to="/temperature">
            <button style={buttonStyle}>Go to Temperature Page</button>
          </Link>
          <Link to="/foodMass">
            <button style={buttonStyle}>Go to Food Mass Page</button>
          </Link>
          <Link to="/bodySize">
            <button style={buttonStyle}>Go to Body Size Page</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

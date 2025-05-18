import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import eggIcon from '../assets/EGG1.png';


const EggMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        cursor: 'pointer',
        width: open ? 'min(calc(90vw), 500px)' : '45px',
        maxWidth: '1500px',
        height: '53px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#0077cc',
        borderRadius: '25px',
        transition: 'width 0.4s ease',
        padding: '0 0',
      }}
      onClick={() => setOpen(!open)}
      aria-label="Toggle navigation menu"
    >
      <img
        src={eggIcon}
        alt="Egg Icon"
        style={{
          width: '50px',
          height: '50px',
          objectFit: 'contain',
          borderRadius: '50%',
        }}
      />
      {open && (
        <nav style={{ marginLeft: '10px', display: 'flex', gap: 'min(calc(100vw/21.2), 30px)' }}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/temperature" style={linkStyle}>Temperature</Link>
          <Link to="/foodMass" style={linkStyle}>Food Mass</Link>
          <Link to="/bodySize" style={linkStyle}>Body Size</Link>
        </nav>
      )}
    </div>
  );
};

const linkStyle = {
  textDecoration: 'right',
  color: 'White',
  fontWeight: 'bold',
  fontSize: 'min(calc(100vw / 31.25), 15px)',
  whiteSpace: 'nowrap',
};

export default EggMenu;

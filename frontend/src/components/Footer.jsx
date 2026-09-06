import React from 'react';

const Footer = () => {
  return (
    <footer style={{ padding: '1.5rem', backgroundColor: '#1f2937', color: '#9ca3af', textAlign: 'center', marginTop: 'auto' }}>
      <p>&copy; {new Date().getFullYear()} Stride E-Commerce. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

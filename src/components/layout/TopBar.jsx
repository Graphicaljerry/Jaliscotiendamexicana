import React from 'react';
import Logo from './Logo';
import './TopBar.css';

function TopBar({ children, rightContent }) {
  return (
    <div className="app-top-bar">
      <div className="top-bar-brand" onClick={() => window.location.hash = '#/'}>
        <Logo size={36} />
        <span className="top-bar-store-name">JALISCO TIENDA MEXICANA</span>
      </div>
      <div className="top-bar-middle">
        {children}
      </div>
      <div className="top-bar-right">
        {rightContent}
      </div>
    </div>
  );
}

export default TopBar;

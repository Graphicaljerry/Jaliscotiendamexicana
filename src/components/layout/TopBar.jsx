import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './TopBar.css';

function TopBar({ children, rightContent }) {
  const navigate = useNavigate();
  return (
    <div className="app-top-bar">
      <div className="top-bar-brand" onClick={() => navigate('/')}>
        <Logo size={36} />
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

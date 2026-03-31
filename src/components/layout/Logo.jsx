import React from 'react';

function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Sombrero dome (coral/red) */}
      <path d="M100 15 C65 15 55 55 55 75 L145 75 C145 55 135 15 100 15Z" fill="#E8736C"/>
      {/* Brim (teal) */}
      <ellipse cx="100" cy="85" rx="88" ry="20" fill="#4ECDC4"/>
      {/* Triangle decorations */}
      <polygon points="20,80 42,105 0,105" fill="#E8736C"/>
      <polygon points="60,80 82,105 38,105" fill="#E8736C"/>
      <polygon points="100,80 122,105 78,105" fill="#E8736C"/>
      <polygon points="140,80 162,105 118,105" fill="#E8736C"/>
      <polygon points="180,80 200,105 158,105" fill="#E8736C"/>
      {/* White diamond gaps */}
      <polygon points="42,80 52,105 32,105" fill="white"/>
      <polygon points="82,80 92,105 72,105" fill="white"/>
      <polygon points="122,80 132,105 112,105" fill="white"/>
      <polygon points="162,80 172,105 152,105" fill="white"/>
      {/* Brim bottom line */}
      <rect x="8" y="105" width="184" height="6" rx="3" fill="#4ECDC4"/>
      {/* Text: JALISCO */}
      <text x="100" y="145" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="800" fill="white" opacity="0.9">JALISCO</text>
      {/* Text: TIENDA MEXICANA */}
      <text x="100" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="white" opacity="0.7" letterSpacing="3">TIENDA MEXICANA</text>
    </svg>
  );
}

export default Logo;

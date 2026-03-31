import React from 'react';

function Logo({ size = 36 }) {
  return (
    <img
      src="/jalisco-tienda-mexicana-logo-white-rgb-2000px-w-72ppi.png"
      alt="Jalisco Tienda Mexicana"
      style={{ height: size, width: 'auto', flexShrink: 0 }}
    />
  );
}

export default Logo;

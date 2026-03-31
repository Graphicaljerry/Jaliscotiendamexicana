import React from 'react';
import logoImg from '../../../public/jalisco-tienda-mexicana-logo-white-rgb-2000px-w-72ppi.png';

function Logo({ size = 36 }) {
  return (
    <img
      src={logoImg}
      alt="Jalisco Tienda Mexicana"
      style={{ height: size, width: 'auto', flexShrink: 0 }}
    />
  );
}

export default Logo;

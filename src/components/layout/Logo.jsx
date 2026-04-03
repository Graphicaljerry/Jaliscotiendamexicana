import React from 'react';
import logoColor from '../../../public/jalisco-logo-color.svg';

function Logo({ size = 36 }) {
  return (
    <img
      src={logoColor}
      alt="Jalisco Tienda Mexicana"
      style={{ height: size, width: 'auto', flexShrink: 0 }}
    />
  );
}

export default Logo;

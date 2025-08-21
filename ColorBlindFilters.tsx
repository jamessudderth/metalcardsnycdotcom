import React from 'react';

const ColorBlindFilters: React.FC = () => {
  return (
    <svg 
      width="0" 
      height="0" 
      style={{ position: 'absolute', visibility: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        {/* Deuteranopia (Red-Green colorblind) filter */}
        <filter id="deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0   0 0
                    0.7   0.3   0   0 0
                    0     0.3   0.7 0 0
                    0     0     0   1 0"
          />
        </filter>
        
        {/* Protanopia (Red-Green colorblind) filter */}
        <filter id="protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                    0.558 0.442 0     0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>
        
        {/* Tritanopia (Blue-Yellow colorblind) filter */}
        <filter id="tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.95  0.05  0     0 0
                    0     0.433 0.567 0 0
                    0     0.475 0.525 0 0
                    0     0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default ColorBlindFilters;
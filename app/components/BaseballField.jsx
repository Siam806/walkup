import React from 'react';

const BaseballField = ({ children }) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-green-600 rounded-lg overflow-hidden shadow-lg border border-gray-400">
      {/* Outfield grass - slightly darker */}
      <div className="absolute inset-0 bg-green-700"></div>

      {/* Infield grass - lighter green */}
      <div className="absolute top-[20%] left-[15%] right-[15%] bottom-[5%] bg-green-500"></div>
      
      {/* Infield dirt */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-[60%] h-[60%] bg-amber-700 rounded-full"></div>
      
      {/* Home plate area */}
      <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-[15%] h-[10%] bg-amber-700"></div>
      
      {/* SVG Lines - Baseball Diamond */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* Home to first base line */}
        <line x1="50%" y1="95%" x2="75%" y2="65%" stroke="white" strokeWidth="2" />
        
        {/* Home to third base line */}
        <line x1="50%" y1="95%" x2="25%" y2="65%" stroke="white" strokeWidth="2" />
        
        {/* First to second base line */}
        <line x1="75%" y1="65%" x2="50%" y2="30%" stroke="white" strokeWidth="2" />
        
        {/* Third to second base line */}
        <line x1="25%" y1="65%" x2="50%" y2="30%" stroke="white" strokeWidth="2" />
        
        {/* FIXED: Foul lines extending to outfield - adjusted to extend more toward corners */}
        <line x1="50%" y1="95%" x2="120%" y2="10%" stroke="white" strokeWidth="1.5" strokeDasharray="5,3" />
        <line x1="50%" y1="95%" x2="-20%" y2="10%" stroke="white" strokeWidth="1.5" strokeDasharray="5,3" />
      </svg>
      
      {/* Pitcher's mound */}
      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 border-2 border-amber-800"></div>
      
      {/* Bases */}
      {/* Home Plate */}
      <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-8 h-8 rotate-45 bg-white border-2 border-gray-600 z-10"></div>
      
      {/* First Base */}
      <div className="absolute bottom-[35%] right-[25%] w-6 h-6 bg-white border-2 border-gray-600 z-10"></div>
      
      {/* Second Base */}
      <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-600 z-10"></div>
      
      {/* Third Base */}
      <div className="absolute bottom-[35%] left-[25%] w-6 h-6 bg-white border-2 border-gray-600 z-10"></div>
      
      {/* Outfield grass pattern - subtle stripes */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="absolute h-full bg-green-650 opacity-20"
            style={{ 
              left: `${i * 12.5}%`, 
              width: '6.25%' 
            }}
          ></div>
        ))}
      </div>
      
      {/* Outfield arc/fence marker */}
      <div className="absolute top-[15%] left-[10%] right-[10%] h-2 border-t-2 border-white rounded-t-full"></div>
      
      {/* On-deck circles */}
      <div className="absolute bottom-[15%] left-[15%] w-6 h-6 rounded-full border-2 border-white"></div>
      <div className="absolute bottom-[15%] right-[15%] w-6 h-6 rounded-full border-2 border-white"></div>
      
      {/* Position Drop Zones will be placed here */}
      {children}
      
      {/* Position Labels with better visibility */}
      <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">P</div>
      <div className="absolute bottom-[12%] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">C</div>
      <div className="absolute bottom-[35%] right-[19%] px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">1B</div>
      <div className="absolute top-[33%] left-1/2 transform -translate-x-1/2 translate-x-4 px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">2B</div>
      <div className="absolute top-[40%] left-[28%] px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">SS</div>
      <div className="absolute bottom-[35%] left-[19%] px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">3B</div>
      <div className="absolute top-[12%] left-[25%] px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">LF</div>
      <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">CF</div>
      <div className="absolute top-[12%] right-[25%] px-2 py-1 bg-black bg-opacity-70 rounded-full text-xs text-white font-bold">RF</div>
      
      {/* Field title */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-500 text-white font-bold rounded-lg shadow-md border border-blue-600">
        Baseball Field
      </div>
    </div>
  );
};

export default BaseballField;
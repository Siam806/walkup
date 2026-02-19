import React from 'react';

const BaseballField = ({ children }) => {
  // All coordinates are in a 600x450 viewBox
  // Home plate at (300, 410), diamond rotated 45°
  // Diamond side length ~130px in SVG units

  // Key coordinates
  const home = { x: 300, y: 410 };
  const first = { x: 392, y: 318 };
  const second = { x: 300, y: 226 };
  const third = { x: 208, y: 318 };
  const mound = { x: 300, y: 330 };

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 select-none">
      {/* Full SVG field rendering for crisp geometry */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 450"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outfield grass gradient */}
          <radialGradient id="outfieldGrass" cx="50%" cy="91%" r="85%">
            <stop offset="0%" stopColor="#3a8c3f" />
            <stop offset="60%" stopColor="#2d7a32" />
            <stop offset="100%" stopColor="#1e5e22" />
          </radialGradient>

          {/* Infield grass gradient */}
          <radialGradient id="infieldGrass" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4caf50" />
            <stop offset="100%" stopColor="#3d9141" />
          </radialGradient>

          {/* Dirt gradient */}
          <radialGradient id="dirtGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c68642" />
            <stop offset="70%" stopColor="#b5722e" />
            <stop offset="100%" stopColor="#9a5f24" />
          </radialGradient>

          {/* Mound dirt */}
          <radialGradient id="moundGradient" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#d4955a" />
            <stop offset="100%" stopColor="#b5722e" />
          </radialGradient>

          {/* Warning track */}
          <radialGradient id="warningTrack" cx="50%" cy="100%" r="78%">
            <stop offset="88%" stopColor="transparent" />
            <stop offset="89%" stopColor="#9a7b4f" />
            <stop offset="95%" stopColor="#8b6c42" />
            <stop offset="96%" stopColor="transparent" />
          </radialGradient>

          {/* Clipping path for the entire field (rounded rectangle) */}
          <clipPath id="fieldClip">
            <rect x="0" y="0" width="600" height="450" rx="12" />
          </clipPath>

          {/* Outfield fence arc clip */}
          <clipPath id="fenceClip">
            <ellipse cx="300" cy="450" rx="310" ry="420" />
          </clipPath>
        </defs>

        <g clipPath="url(#fieldClip)">
          {/* === BACKGROUND / OUTFIELD === */}
          <rect x="0" y="0" width="600" height="450" fill="url(#outfieldGrass)" />

          {/* Mowing stripes – alternating lighter bands radiating from home */}
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = -70 + i * 17.5; // spread from -70° to +70°
            const rad = (angle * Math.PI) / 180;
            const len = 500;
            const x2 = home.x + Math.sin(rad) * len;
            const y2 = home.y - Math.cos(rad) * len;
            return (
              <line
                key={`stripe-${i}`}
                x1={home.x}
                y1={home.y}
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                strokeWidth="28"
              />
            );
          })}

          {/* === WARNING TRACK === */}
          <ellipse cx="300" cy="450" rx="310" ry="420" fill="none" stroke="#8b6c42" strokeWidth="18" opacity="0.5" />

          {/* === OUTFIELD FENCE === */}
          <ellipse cx="300" cy="450" rx="302" ry="412" fill="none" stroke="#1a3a1a" strokeWidth="4" />

          {/* Fence posts */}
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = -72 + i * 14.4;
            const rad = (angle * Math.PI) / 180;
            const cx = 300 + Math.sin(rad) * 302;
            const cy = 450 - Math.cos(rad) * 412;
            if (cy > 5 && cy < 445 && cx > 5 && cx < 595) {
              return <circle key={`post-${i}`} cx={cx} cy={cy} r="3" fill="#333" opacity="0.5" />;
            }
            return null;
          })}

          {/* === FOUL LINES (full length to fence) === */}
          <line x1={home.x} y1={home.y} x2="598" y2="55" stroke="white" strokeWidth="2.5" opacity="0.9" />
          <line x1={home.x} y1={home.y} x2="2" y2="55" stroke="white" strokeWidth="2.5" opacity="0.9" />

          {/* === INFIELD DIRT DIAMOND === */}
          {/* Outer dirt area – a rounded diamond shape */}
          <path
            d={`
              M ${home.x} ${home.y + 18}
              Q ${first.x + 30} ${first.y + 15}, ${first.x + 18} ${first.y - 10}
              Q ${second.x + 15} ${second.y - 30}, ${second.x} ${second.y - 18}
              Q ${third.x - 15} ${second.y - 30}, ${third.x - 18} ${third.y - 10}
              Q ${third.x - 30} ${third.y + 15}, ${home.x} ${home.y + 18}
              Z
            `}
            fill="url(#dirtGradient)"
          />

          {/* Infield grass (inside the basepaths) */}
          <path
            d={`
              M ${home.x} ${home.y - 8}
              L ${first.x - 8} ${first.y}
              L ${second.x} ${second.y + 8}
              L ${third.x + 8} ${third.y}
              Z
            `}
            fill="url(#infieldGrass)"
          />

          {/* === BASEPATHS (white lines) === */}
          <line x1={home.x} y1={home.y} x2={first.x} y2={first.y} stroke="white" strokeWidth="2" />
          <line x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke="white" strokeWidth="2" />
          <line x1={second.x} y1={second.y} x2={third.x} y2={third.y} stroke="white" strokeWidth="2" />
          <line x1={third.x} y1={third.y} x2={home.x} y2={home.y} stroke="white" strokeWidth="2" />

          {/* === BATTER'S BOX AREA (home plate dirt circle) === */}
          <ellipse cx={home.x} cy={home.y} rx="30" ry="22" fill="#b5722e" />

          {/* Batter's boxes (left and right) */}
          <rect x={home.x - 28} y={home.y - 16} width="16" height="32" rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
          <rect x={home.x + 12} y={home.y - 16} width="16" height="32" rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />

          {/* Catcher's box */}
          <rect x={home.x - 14} y={home.y + 14} width="28" height="16" rx="2" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />

          {/* === HOME PLATE (proper pentagon) === */}
          <polygon
            points={`
              ${home.x},${home.y - 6}
              ${home.x + 6},${home.y - 2}
              ${home.x + 6},${home.y + 4}
              ${home.x - 6},${home.y + 4}
              ${home.x - 6},${home.y - 2}
            `}
            fill="white"
            stroke="#888"
            strokeWidth="1"
          />

          {/* === PITCHER'S MOUND === */}
          <ellipse cx={mound.x} cy={mound.y} rx="20" ry="16" fill="url(#moundGradient)" />
          {/* Pitching rubber */}
          <rect x={mound.x - 8} y={mound.y - 2} width="16" height="4" rx="1" fill="white" stroke="#999" strokeWidth="0.5" />

          {/* === BASES === */}
          {/* First Base */}
          <rect
            x={first.x - 5} y={first.y - 5} width="10" height="10"
            transform={`rotate(45, ${first.x}, ${first.y})`}
            fill="white" stroke="#ccc" strokeWidth="1"
          />
          {/* Second Base */}
          <rect
            x={second.x - 5} y={second.y - 5} width="10" height="10"
            transform={`rotate(45, ${second.x}, ${second.y})`}
            fill="white" stroke="#ccc" strokeWidth="1"
          />
          {/* Third Base */}
          <rect
            x={third.x - 5} y={third.y - 5} width="10" height="10"
            transform={`rotate(45, ${third.x}, ${third.y})`}
            fill="white" stroke="#ccc" strokeWidth="1"
          />

          {/* === BASE CUTOUTS (dirt around bases) === */}
          <circle cx={first.x} cy={first.y} r="14" fill="#b5722e" opacity="0.6" />
          <circle cx={second.x} cy={second.y} r="14" fill="#b5722e" opacity="0.6" />
          <circle cx={third.x} cy={third.y} r="14" fill="#b5722e" opacity="0.6" />

          {/* Re-draw bases on top of dirt cutouts */}
          <rect
            x={first.x - 5} y={first.y - 5} width="10" height="10"
            transform={`rotate(45, ${first.x}, ${first.y})`}
            fill="white" stroke="#bbb" strokeWidth="1"
          />
          <rect
            x={second.x - 5} y={second.y - 5} width="10" height="10"
            transform={`rotate(45, ${second.x}, ${second.y})`}
            fill="white" stroke="#bbb" strokeWidth="1"
          />
          <rect
            x={third.x - 5} y={third.y - 5} width="10" height="10"
            transform={`rotate(45, ${third.x}, ${third.y})`}
            fill="white" stroke="#bbb" strokeWidth="1"
          />

          {/* === ON-DECK CIRCLES === */}
          <circle cx={home.x - 60} cy={home.y + 10} r="10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
          <circle cx={home.x + 60} cy={home.y + 10} r="10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />

          {/* === COACH BOXES (dashed) === */}
          <rect x={first.x + 20} y={first.y + 10} width="10" height="40" rx="2" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
          <rect x={third.x - 30} y={third.y + 10} width="10" height="40" rx="2" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />

          {/* === OUTFIELD DISTANCE MARKERS === */}
          {[
            { label: '330', angle: -55, dist: 0.72 },
            { label: '370', angle: -30, dist: 0.78 },
            { label: '400', angle: 0, dist: 0.82 },
            { label: '370', angle: 30, dist: 0.78 },
            { label: '330', angle: 55, dist: 0.72 },
          ].map(({ label, angle, dist }, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = home.x + Math.sin(rad) * 412 * dist;
            const cy = home.y - Math.cos(rad) * 412 * dist;
            return (
              <text
                key={`dist-${i}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                opacity="0.5"
                fontFamily="system-ui, sans-serif"
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Position drop zones (children from fieldLayout) */}
      {children}
    </div>
  );
};

export default BaseballField;
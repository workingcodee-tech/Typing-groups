import React from 'react';

interface AnalogSpeedometerProps {
  wpm: number;
  maxWpm?: number;
  size?: number;
  className?: string;
}

export const AnalogSpeedometer = React.memo<AnalogSpeedometerProps>(({
  wpm,
  maxWpm = 160,
  size,
  className
}) => {
  // Clamp speed
  const clampedWpm = Math.min(maxWpm, Math.max(0, wpm));

  // Needle angle: from -120deg (0 WPM) to +120deg (maxWpm)
  const minAngle = -120;
  const maxAngle = 120;
  const needleAngle = minAngle + (clampedWpm / maxWpm) * (maxAngle - minAngle);

  // Generate tick marks (0, 20, 40, 60, 80, 100, 120, 140, 160)
  const ticks = [0, 20, 40, 60, 80, 100, 120, 140, 160];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className || ''}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
      >
        {/* Outer bezel */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#080d1a"
          stroke="#1e293b"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#050811"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Speed Arc Gradient */}
        <path
          d="M 18.5 70 A 37 37 0 1 1 81.5 70"
          fill="none"
          stroke="url(#speedometerArc)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Ticks and Numbers */}
        {ticks.map((tickVal) => {
          const tickAngle = minAngle + (tickVal / maxWpm) * (maxAngle - minAngle);
          const rad = (tickAngle - 90) * (Math.PI / 180);
          const isMajor = tickVal % 40 === 0;
          const r1 = 43;
          const r2 = isMajor ? 36 : 39;
          const x1 = 50 + r1 * Math.cos(rad);
          const y1 = 50 + r1 * Math.sin(rad);
          const x2 = 50 + r2 * Math.cos(rad);
          const y2 = 50 + r2 * Math.sin(rad);

          // Number position
          const rText = 30;
          const xt = 50 + rText * Math.cos(rad);
          const yt = 50 + rText * Math.sin(rad) + 2.5;

          return (
            <g key={tickVal}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={isMajor ? 1.5 : 1}
              />
              {isMajor && (
                <text
                  x={xt}
                  y={yt}
                  fill="#94a3b8"
                  fontSize="6.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {tickVal}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: '50px 50px',
            transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.4, 1)'
          }}
        >
          {/* Needle shadow */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="14"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Main needle */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="14"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="16"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </g>

        {/* Center Cap */}
        <circle cx="50" cy="50" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="#38bdf8" />

        {/* Digital Label */}
        <text
          x="50"
          y="74"
          fill="#38bdf8"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
        >
          {Math.round(clampedWpm)}
        </text>
        <text
          x="50"
          y="82"
          fill="#64748b"
          fontSize="5"
          fontWeight="semibold"
          textAnchor="middle"
          letterSpacing="0.5"
          fontFamily="'JetBrains Mono', monospace"
        >
          WPM
        </text>

        <defs>
          <linearGradient id="speedometerArc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

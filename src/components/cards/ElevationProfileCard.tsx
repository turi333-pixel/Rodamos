"use client";

export interface ElevPoint { km: number; elev: number; }

interface Props {
  points: ElevPoint[];
  totalKm: number;
}

export function ElevationProfileCard({ points, totalKm }: Props) {
  if (points.length < 2) return null;

  // ── chart geometry ──────────────────────────────────────────────────────────
  const W = 420;
  const leftPad = 42;
  const rightPad = 8;
  const topPad = 28;   // room for peak pill
  const bottomPad = 18; // room for x labels
  const chartW = W - leftPad - rightPad;
  const chartH = 88;
  const H = topPad + chartH + bottomPad;

  // ── data range ──────────────────────────────────────────────────────────────
  const maxElev = Math.max(...points.map(p => p.elev));
  const yMax = Math.ceil(maxElev / 100) * 100 || 100;
  const yMid = Math.round(yMax / 2 / 50) * 50;
  const yMin = 0;

  const usableKm = totalKm || points[points.length - 1].km;

  const toX = (km: number) => leftPad + (km / usableKm) * chartW;
  const toY = (e: number) => topPad + chartH - (e / yMax) * chartH;

  // ── SVG paths ───────────────────────────────────────────────────────────────
  const coords = points.map(p => ({ x: toX(p.km), y: toY(p.elev) }));
  const lineD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaD =
    `${lineD} ` +
    `L${coords[coords.length - 1].x.toFixed(1)},${(topPad + chartH).toFixed(1)} ` +
    `L${coords[0].x.toFixed(1)},${(topPad + chartH).toFixed(1)} Z`;

  // ── peak ────────────────────────────────────────────────────────────────────
  const peak = points.reduce((a, b) => (b.elev > a.elev ? b : a));
  const px = toX(peak.km);
  const py = toY(peak.elev);
  // pill stays inside the chart
  const pillW = 44;
  const pillX = Math.min(Math.max(px - pillW / 2, leftPad), W - rightPad - pillW);

  // ── axes ────────────────────────────────────────────────────────────────────
  const yLabels = [yMin, yMid, yMax];
  const xLabels = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    label: `${Math.round(f * usableKm)} km`,
    x: toX(f * usableKm),
  }));

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🏔️</span>
          <span className="text-sm font-semibold text-white">Perfil de elevación</span>
        </div>
        <div className="text-xs text-zinc-500">{Math.round(maxElev)} m máx</div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: "block" }}>
          <defs>
            <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines + Y-axis labels */}
          {yLabels.map(y => {
            const yp = toY(y);
            return (
              <g key={y}>
                <line
                  x1={leftPad} y1={yp} x2={W - rightPad} y2={yp}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3,4"
                />
                <text
                  x={leftPad - 5} y={yp + 3.5}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9.5"
                  fontFamily="system-ui, sans-serif"
                >
                  {y} m
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#elevFill)" />

          {/* Route line */}
          <path
            d={lineD}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Peak dot */}
          <circle cx={px} cy={py} r="4" fill="white" />
          <circle cx={px} cy={py} r="2" fill="#1a6fff" />

          {/* Peak pill */}
          <rect x={pillX} y={py - 24} width={pillW} height={17} rx={5} fill="#1a6fff" />
          <text
            x={pillX + pillW / 2} y={py - 12}
            textAnchor="middle"
            fill="white"
            fontSize="9.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            {Math.round(peak.elev)} m
          </text>
          {/* pill stem */}
          <line x1={px} y1={py - 7} x2={px} y2={py - 4} stroke="white" strokeWidth="1.5" />

          {/* X-axis labels */}
          {xLabels.map(l => (
            <text
              key={l.label}
              x={l.x} y={topPad + chartH + 14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="9.5"
              fontFamily="system-ui, sans-serif"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

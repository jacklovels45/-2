import { useId, useMemo, useState } from "react";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  fill?: string;
  showAxis?: boolean;
  formatValue?: (v: number) => string;
}

/** 自定义 SVG 折线图，支持悬停 tooltip */
export function LineChart({
  data,
  height = 220,
  color = "#0F3D2E",
  fill = "rgba(15, 61, 46, 0.08)",
  showAxis = true,
  formatValue = (v) => v.toString(),
}: LineChartProps) {
  const gradientId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 800;
  const padding = { top: 20, right: 24, bottom: 32, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const { maxV, minV, points, areaPath, linePath, ticks } = useMemo(() => {
    if (data.length === 0) {
      return { maxV: 0, minV: 0, points: [], areaPath: "", linePath: "", ticks: [] };
    }
    const values = data.map((d) => d.value);
    const rawMax = Math.max(...values, 0);
    const rawMin = Math.min(...values, 0);
    const span = rawMax - rawMin || 1;
    const maxV = rawMax + span * 0.15;
    const minV = Math.min(0, rawMin - span * 0.05);
    const range = maxV - minV || 1;

    const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;
    const points = data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + innerH - ((d.value - minV) / range) * innerH;
      return { x, y, ...d };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaPath =
      `M ${points[0].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} ` +
      points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`;

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const v = minV + (range * i) / tickCount;
      return { v, y: padding.top + innerH - (i / tickCount) * innerH };
    });

    return { maxV, minV, points, areaPath, linePath, ticks };
  }, [data, innerW, innerH, padding.left, padding.top]);

  if (data.length === 0) {
    return <div className="text-center text-ink-300 text-sm py-10">暂无数据</div>;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* 网格线 & Y轴标签 */}
      {showAxis &&
        ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={t.y}
              x2={width - padding.right}
              y2={t.y}
              stroke="#E3E5DF"
              strokeDasharray="3 4"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="#9CA097"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatValue(t.v)}
            </text>
          </g>
        ))}

      {/* X轴标签 */}
      {showAxis &&
        points.map((p, i) => {
          // 太密集时跳过部分
          const skip = Math.ceil(points.length / 8);
          if (i % skip !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#9CA097"
            >
              {p.label}
            </text>
          );
        })}

      {/* 区域填充 */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* 折线 */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 2000, strokeDashoffset: 0, animation: "draw-line 1.2s ease-out forwards" }}
      />

      {/* 数据点 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 5 : 3}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth={2}
            className="transition-all"
          />
          {/* 隐形热区 */}
          <rect
            x={p.x - 18}
            y={padding.top}
            width={36}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
          />
        </g>
      ))}

      {/* Tooltip */}
      {hoverIdx !== null && points[hoverIdx] && (
        <g>
          <line
            x1={points[hoverIdx].x}
            y1={padding.top}
            x2={points[hoverIdx].x}
            y2={padding.top + innerH}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.5}
          />
          <g
            transform={`translate(${Math.min(
              Math.max(points[hoverIdx].x, padding.left + 60),
              width - padding.right - 60
            )}, ${Math.max(points[hoverIdx].y - 50, padding.top)})`}
          >
            <rect x={-56} y={-2} width={112} height={36} rx={6} fill="#1A1F1C" opacity={0.92} />
            <text x={0} y={12} textAnchor="middle" fill="#F5F1E8" fontSize="11">
              {points[hoverIdx].label}
            </text>
            <text
              x={0}
              y={26}
              textAnchor="middle"
              fill="#D4A24C"
              fontSize="13"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatValue(points[hoverIdx].value)}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  formatValue?: (v: number) => string;
  horizontal?: boolean;
}

export function BarChart({
  data,
  height = 240,
  formatValue = (v) => v.toString(),
  horizontal = false,
}: BarChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxV = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="group flex items-center gap-3"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="w-24 text-sm text-ink-700 truncate text-right shrink-0">
              {d.label}
            </div>
            <div className="flex-1 h-7 bg-cream-100 rounded-md relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
                style={{
                  width: `${(d.value / maxV) * 100}%`,
                  background: d.color || "linear-gradient(90deg, #0F3D2E, #2C6B41)",
                  opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5,
                }}
              />
              <div className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-ink-700 tabular">
                {formatValue(d.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const width = 800;
  const padding = { top: 20, right: 16, bottom: 36, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = data.length > 0 ? innerW / data.length : innerW;
  const barW = Math.min(40, stepX * 0.6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* 网格 */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={padding.top + innerH - r * innerH}
            x2={width - padding.right}
            y2={padding.top + innerH - r * innerH}
            stroke="#E3E5DF"
            strokeDasharray="3 4"
          />
          <text
            x={padding.left - 6}
            y={padding.top + innerH - r * innerH}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="#9CA097"
            fontFamily="JetBrains Mono, monospace"
          >
            {formatValue(maxV * r)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padding.left + i * stepX + (stepX - barW) / 2;
        const h = (d.value / maxV) * innerH;
        const y = padding.top + innerH - h;
        return (
          <g
            key={i}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 1)}
              rx={4}
              fill={d.color || "#0F3D2E"}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.45}
              className="transition-all"
            />
            {hoverIdx === i && (
              <g>
                <rect x={x - 12} y={y - 28} width={barW + 24} height={22} rx={4} fill="#1A1F1C" opacity={0.92} />
                <text
                  x={x + barW / 2}
                  y={y - 14}
                  textAnchor="middle"
                  fill="#D4A24C"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatValue(d.value)}
                </text>
              </g>
            )}
            <text
              x={x + barW / 2}
              y={height - 14}
              textAnchor="middle"
              fontSize="11"
              fill="#6E7368"
            >
              {d.label.length > 6 ? d.label.slice(0, 5) + "…" : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  formatValue?: (v: number) => string;
}

export function DonutChart({
  data,
  size = 180,
  formatValue = (v) => v.toString(),
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2;
  const innerRadius = radius * 0.62;
  const cx = radius;
  const cy = radius;

  let accAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const start = accAngle;
    const end = accAngle + angle;
    accAngle = end;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const x3 = cx + innerRadius * Math.cos(end);
    const y3 = cy + innerRadius * Math.sin(end);
    const x4 = cx + innerRadius * Math.cos(start);
    const y4 = cy + innerRadius * Math.sin(start);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    return { ...d, path, percent: d.value / total };
  });

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-ink-300 text-sm" style={{ height: size }}>
        暂无数据
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            className="transition-all hover:opacity-80"
          />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="11"
          fill="#6E7368"
        >
          合计
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill="#1A1F1C"
          fontFamily="JetBrains Mono, monospace"
        >
          {formatValue(total)}
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-ink-700 truncate">{s.label}</span>
            <span className="tabular text-ink-800 font-medium">
              {(s.percent * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 80, height = 28, color = "#0F3D2E" }: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const gid = useId();
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.4} fill={color} />
    </svg>
  );
}

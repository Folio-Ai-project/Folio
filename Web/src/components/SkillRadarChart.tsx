import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type RadarData = { subject: string; value: number };

const DEFAULT_DATA: RadarData[] = [
  { subject: "프로그래밍", value: 80 },
  { subject: "데이터베이스", value: 65 },
  { subject: "시스템 설계", value: 55 },
  { subject: "DevOps", value: 40 },
  { subject: "협업/소통", value: 70 },
  { subject: "문제 해결", value: 75 },
];

function getColor(value: number) {
  if (value >= 75) return "#0A6EFF";
  if (value >= 60) return "#2EA8FF";
  if (value >= 45) return "#54C0F5";
  return "#AAD8E8";
}

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: RadarData;
};

function CustomDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  const color = getColor(payload.value);
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={12} fontWeight={700} fill={color}>
        {payload.value}
      </text>
    </g>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: { payload: RadarData }[];
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { subject, value } = payload[0].payload;
  const color = getColor(value);
  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${color}`,
      borderRadius: 8,
      padding: "6px 14px",
      fontSize: 13,
      fontWeight: 600,
      color,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      {subject}: {value}점
    </div>
  );
}

function SkillRadarChart({ data }: { data?: RadarData[] }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData} outerRadius={110}>
          <PolarGrid gridType="polygon" stroke="#e9ecef" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: "#495057", fontWeight: 500 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="내 역량"
            dataKey="value"
            stroke="#46BEFF"
            fill="#46BEFF"
            fillOpacity={0.2}
            dot={(props) => <CustomDot {...props} />}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: "1.5em", marginTop: "0.5em" }}>
        {[
          { label: "높음 (75+)", color: "#0A6EFF" },
          { label: "중간 (45~74)", color: "#2EA8FF" },
          { label: "낮음 (~44)", color: "#AAD8E8" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#868e96" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillRadarChart;

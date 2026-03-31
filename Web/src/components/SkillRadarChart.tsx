import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
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

function SkillRadarChart({ data }: { data?: RadarData[] }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: "#555" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} />
        <Radar
          name="내 역량"
          dataKey="value"
          stroke="#46BEFF"
          fill="#46BEFF"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default SkillRadarChart;

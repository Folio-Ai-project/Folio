import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/*
  🔥 1️⃣ 데이터 타입 정의
  나중에 백엔드 연결할 때 이 구조로 맞추면 됨
*/
export interface SkillData {
  name: string;   // 기술 이름 (백엔드 개발 등)
  value: number;  // 점수 (0~100)
}

/*
  🔥 2️⃣ Props 타입 정의
  data만 넣어주면 동작하는 구조
*/
interface SkillBarChartProps {
  data: SkillData[];
}

/*
  🔥 3️⃣ 퍼센트에 따라 색상 변경 (선택)
  나중에 기준 바꾸고 싶으면 여기 수정
*/
const getBarColor = (value: number) => {
  if (value >= 90) return "#0A6EFF";  // 진한 파랑
  if (value >= 75) return "#2EA8FF";  // 파랑
  if (value >= 60) return "#54C0F5";  // 하늘
  if (value >= 45) return "#85D4F0";  // 연하늘
  if (value >= 30) return "#AAD8E8";  // 아주 연한 하늘
  return "#C8E8F5";                   // 거의 흰 하늘
};

/*
  🔥 4️⃣ 재사용 가능한 막대 그래프 컴포넌트
*/
function SkillBarChart({ data }: SkillBarChartProps) {
  return (
    /*
      ResponsiveContainer
      👉 부모 width에 맞게 자동 반응
    */
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"   // 🔥 세로형 막대 (가로 퍼센트 바 만들기 위해 필수)
        margin={{ top: 30, right: 20, left: 20, bottom: 10 }}
      >
        {/* 배경 그리드 제거 (깔끔하게 만들기 위해) */}
        <CartesianGrid strokeDasharray="0" horizontal={false} />

        {/* X축은 점수 (0~100) */}
        <XAxis
          type="number"
          domain={[0, 100]}   // 🔥 점수 범위
          hide                // 축 숨김 (UI 깔끔하게)
        />

        {/* Y축은 기술 이름 */}
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 14 }}
        />

        {/* 마우스 올렸을 때 툴팁 */}
        <Tooltip formatter={(value) => `${value}%`} />

        {/* 실제 막대 */}
        <Bar
          dataKey="value"
          radius={[10, 10, 10, 10]}  // 둥근 모서리
          barSize={18}               // 막대 두께
        >
          {data.map((entry, index) => (
            /*
              🔥 Cell을 사용하면
              각 막대마다 색상 다르게 가능
            */
            <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default SkillBarChart;

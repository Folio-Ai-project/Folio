import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

/*
  🔥 이 데이터는 나중에 AI 분석 결과로 교체할 부분
  지금은 테스트용 더미 데이터
*/
const skillData = [
  { subject: "프로그래밍", value: 80 },
  { subject: "데이터베이스", value: 65 },
  { subject: "시스템 설계", value: 55 },
  { subject: "DevOps", value: 40 },
  { subject: "협업/소통", value: 70 },
  { subject: "문제 해결", value: 75 },
];

/*
  🔥 레이더 차트 컴포넌트
  Analysis 페이지 안에 그냥 <SkillRadarChart /> 쓰면 됨
*/
function SkillRadarChart() {
  return (
    /*
      ResponsiveContainer
      👉 부모 div 크기에 맞게 자동 반응형
      👉 width 100% 필수
    */
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={skillData}>
        
        {/* 배경 원형 그리드 */}
        <PolarGrid />

        {/* 바깥에 항목 이름 (프로그래밍, DB 이런거) */}
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 13, fill: "#555" }}
        />

        {/* 점수 범위 (0~100) */}
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false} // 안쪽 숫자 숨기기 (깔끔)
        />

        {/* 🔥 핵심 그래프 */}
        <Radar
          name="내 역량"
          dataKey="value"   // skillData의 value 사용
          stroke="#46BEFF"  // 테두리 색
          fill="#46BEFF"    // 내부 색
          fillOpacity={0.35} // 투명도
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default SkillRadarChart;

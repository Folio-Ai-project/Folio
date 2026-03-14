import './App.css'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Layout from './pages/Layout'
import { MainPage } from './pages/MainPage'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/SignupPage'
import MyPage from './pages/Mypage'
import Analysis from './pages/Analysis'
import Recommend from './pages/Recommend'
import Roadmap from './pages/Roadmap'
import NotFound from './pages/NotFound'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")

    // ✅ 로그인 없이 접근 허용할 페이지들
    const publicPaths = ["/", "/login", "/signup"]

    // ✅ public 페이지면 그냥 통과
    if (publicPaths.includes(location.pathname)) return

    // ✅ 토큰 없으면 로그인으로 보내기
    if (!token) {
      navigate("/login", { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<MainPage />} />
        <Route path='/Analysis' element={<Analysis />} />
        <Route path='/Recommend' element={<Recommend />} />
        <Route path='/Roadmap' element={<Roadmap />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
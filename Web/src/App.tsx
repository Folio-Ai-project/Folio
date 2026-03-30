import './App.css'
import { Routes, Route } from 'react-router-dom'

import Layout from './pages/Layout'
import { MainPage } from './pages/MainPage'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/SignupPage'
import {MyPage} from './pages/Mypage'
import Analysis from './pages/Analysis'
import Recommend from './pages/Recommend'
import Roadmap from './pages/Roadmap'
import NotFound from './pages/NotFound'

function App() {
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
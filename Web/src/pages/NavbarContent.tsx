import Navbar from 'react-bootstrap/Navbar';
import styled from 'styled-components';
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../store"
import { logout as logoutAction } from "../store"



type NavbarGridProps = {
  jc?: React.CSSProperties['justifyContent'];
};

let GridBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.2fr 0.2fr 0.2fr 0.2fr 1fr;
  width: 100%;
  height: 100%;
`
let NavbarGrid = styled.div<NavbarGridProps>`
  display: flex;
  justify-content: ${ props => props.jc || 'center' };
  align-items: center;
  height: 3.2em;
  width: 100%;
`

function NavbarContent(){
  let navigator = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.user)

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(logoutAction());
    navigator('/login');
  };

  return (
    <Navbar className="bg-body-tertiary">
      <GridBox>
        <NavbarGrid jc="flex-start">
          <Link className='NavbarContentLogo' to={"/"}>Polio</Link>
        </NavbarGrid>
        <NavbarGrid >
          <a onClick={()=>{
            if(isLoggedIn==true){
              navigator('/Analysis')}
            else{alert('로그인이 필요한 서비스입니다.'),
              navigator('/login')}
            }} className='NavbarContentText'>분석 결과</a>
        </NavbarGrid>
        <NavbarGrid>
          <a onClick={()=>{
            if(isLoggedIn==true){
              navigator('/Recommend')}
            else{alert('로그인이 필요한 서비스입니다.'),
              navigator('/login')}
            }} className='NavbarContentText'>기업 추천</a>
        </NavbarGrid>
        <NavbarGrid>
          <a onClick={()=>{
            if(isLoggedIn==true){
              navigator('/Roadmap')}
            else{alert('로그인이 필요한 서비스입니다.'),
              navigator('/login')}
            }} className='NavbarContentText'>성장 로드맵</a>
        </NavbarGrid>
        <NavbarGrid style={{ marginLeft: "2em" }}>
          <a onClick={()=>{
            if(isLoggedIn==true){
              navigator('/Review')}
            else{alert('로그인이 필요한 서비스입니다.'),
              navigator('/login')}
            }} className='NavbarContentText'>포트폴리오 개선</a>
        </NavbarGrid>
        <NavbarGrid jc ="flex-end">
          {
            isLoggedIn ? <div><button onClick={()=>{ navigator('/mypage')}} className='NavbarContentLoginBtn'>마이페이지</button> <button onClick={logout} className='NavbarContentLoginOutBtn'>로그아웃</button> </div>
            :<button onClick={()=>{ navigator('/login')}} className='NavbarContentLoginBtn'>로그인</button>
          }
        </NavbarGrid>
      </GridBox>
    </Navbar> 
  );
}

export default NavbarContent
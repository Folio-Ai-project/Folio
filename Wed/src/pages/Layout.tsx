import { Outlet } from "react-router-dom";
import NavbarContent from "./NavbarContent";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../store";

function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(setLogin(!!token));
  }, [dispatch]);

  return (
    <>
      <NavbarContent />
      <Outlet />
    </>
  );
}

export default Layout;
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

function Layout() {
  const token = localStorage.getItem("token");
  const location = useLocation();

 
  const noAuthPages = ["/login", "/register"];

  const shouldShowLayout = token && !noAuthPages.includes(location.pathname);

  return (
    <>
      {shouldShowLayout && <Header />}

      <Outlet />

      {shouldShowLayout && <Footer />}
    </>
  );
}

export default Layout;

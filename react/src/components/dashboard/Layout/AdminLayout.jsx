import React from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
function AdminLayout() {
    const token = localStorage.getItem("token");
    const location = useLocation();
  
    const noAuthPages = ["/login", "/register"];

  const shouldShowLayout = token && !noAuthPages.includes(location.pathname);
  return <>
  
  {shouldShowLayout && <AdminHeader/>}
  
  <Outlet/>
  
  
  </>;
}

export default AdminLayout

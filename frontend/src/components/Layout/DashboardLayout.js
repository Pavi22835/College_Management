import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Footer from './Footer';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <div className="content-wrapper">
          <div className="content-area">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;
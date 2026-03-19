import React, { useState, useEffect } from "react";
import { Users, UserCheck, BookOpen } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import studentApi from "../../api/studentApi";
import staffApi from "../../api/staffApi";  // This is correct - you have staffApi
import courseApi from "../../api/courseApi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser({ name: "Admin User" });
      }
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all counts in parallel
      const [studentsData, staffData, coursesData] = await Promise.all([
        studentApi.getStudents().catch(err => {
          console.error("Students fetch error:", err);
          return [];
        }),
        staffApi.getStaff().catch(err => {
          console.error("Staff fetch error:", err);
          return [];
        }),
        courseApi.getCourses().catch(err => {
          console.error("Courses fetch error:", err);
          return [];
        })
      ]);

      // Log to see what we're getting (for debugging)
      console.log("Students data:", studentsData);
      console.log("Staff data:", staffData);
      console.log("Courses data:", coursesData);

      // Calculate counts (handle both array and object responses)
      const studentsCount = Array.isArray(studentsData) 
        ? studentsData.length 
        : studentsData?.length || 0;

      const staffCount = Array.isArray(staffData) 
        ? staffData.length 
        : staffData?.length || 0;

      const coursesCount = Array.isArray(coursesData) 
        ? coursesData.length 
        : coursesData?.length || 0;

      setStats({
        students: studentsCount,
        teachers: staffCount,
        courses: coursesCount
      });

    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.name || "Admin"}</p>
        </div>
        {/* Removed top Logout button */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <span>{error}</span>
          <button className="retry-btn" onClick={fetchStats}>
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="loading-container">Loading statistics...</div>
      ) : (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Students</span>
              <span className="stat-number">{stats.students}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <UserCheck size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Teachers</span>
              <span className="stat-number">{stats.teachers}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <BookOpen size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Courses</span>
              <span className="stat-number">{stats.courses}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button 
            className="action-card"
            onClick={() => navigate("/admin/students")}  // Updated path
          >
            <span className="action-icon">➕</span>
            <span className="action-text">Add Student</span>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate("/admin/staff")}  // Updated path
          >
            <span className="action-icon">➕</span>
            <span className="action-text">Add Teacher</span>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate("/admin/courses")}  // Updated path
          >
            <span className="action-icon">➕</span>
            <span className="action-text">Add Course</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>© {new Date().getFullYear()} Student Management System</p>
      </div>
    </div>
  );
};

export default Dashboard;
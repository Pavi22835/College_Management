import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="profile-page-card">
        <h1>My Profile</h1>
        <p>Manage your account details and preferences.</p>

        <div className="profile-details-grid">
          <div className="profile-detail-card">
            <h3>Name</h3>
            <p>{user?.name || 'N/A'}</p>
          </div>
          <div className="profile-detail-card">
            <h3>Email</h3>
            <p>{user?.email || 'N/A'}</p>
          </div>
          <div className="profile-detail-card">
            <h3>Role</h3>
            <p>{user?.role || 'N/A'}</p>
          </div>
          <div className="profile-detail-card">
            <h3>Status</h3>
            <p>{user?.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

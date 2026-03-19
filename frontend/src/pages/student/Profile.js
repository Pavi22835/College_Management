import React from 'react';

const StudentProfile = () => {
  return (
    <div className="page-container">
      <h1>Profile Management</h1>
      <p>Update your personal information and manage your student profile.</p>

      <div className="profile-sections">
        <div className="section-card">
          <h3>Personal Information</h3>
          <p>Update your name, contact details, and other personal info</p>
          <button className="btn-primary">Update Profile</button>
        </div>

        <div className="section-card">
          <h3>Enrolled Courses</h3>
          <p>View courses you're currently enrolled in and teachers</p>
          <button className="btn-primary">View Courses</button>
        </div>

        <div className="section-card">
          <h3>Fee Status</h3>
          <p>Check your fee payment status and outstanding amounts</p>
          <button className="btn-primary">Check Fees</button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
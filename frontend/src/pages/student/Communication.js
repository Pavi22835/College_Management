import React from 'react';

const StudentCommunication = () => {
  return (
    <div className="page-container">
      <h1>Communication</h1>
      <p>Receive announcements, contact teachers, and stay updated with notifications.</p>

      <div className="communication-sections">
        <div className="section-card">
          <h3>Teacher Announcements</h3>
          <p>View important announcements from your teachers</p>
          <button className="btn-primary">View Announcements</button>
        </div>

        <div className="section-card">
          <h3>Contact Teachers</h3>
          <p>Send emails or messages to your teachers</p>
          <button className="btn-primary">Contact Teacher</button>
        </div>

        <div className="section-card">
          <h3>Notifications</h3>
          <p>Check notifications about holidays, events, and updates</p>
          <button className="btn-primary">View Notifications</button>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunication;
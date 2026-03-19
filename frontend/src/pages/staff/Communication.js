import React from 'react';

const StaffCommunication = () => {
  return (
    <div className="page-container">
      <h1>Communication</h1>
      <p>Announce notices, send reminders, and communicate with students and parents.</p>

      <div className="communication-sections">
        <div className="section-card">
          <h3>Announce Notices</h3>
          <p>Post important announcements for your classes</p>
          <button className="btn-primary">Create Notice</button>
        </div>

        <div className="section-card">
          <h3>Send Reminders</h3>
          <p>Send deadline reminders and important notifications</p>
          <button className="btn-primary">Send Reminder</button>
        </div>

        <div className="section-card">
          <h3>Contact Students</h3>
          <p>Send messages directly to individual students</p>
          <button className="btn-primary">Contact Student</button>
        </div>

        <div className="section-card">
          <h3>Communicate with Parents</h3>
          <p>Send messages to parents regarding student progress</p>
          <button className="btn-primary">Contact Parents</button>
        </div>
      </div>
    </div>
  );
};

export default StaffCommunication;

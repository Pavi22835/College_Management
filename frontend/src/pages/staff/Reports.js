import React from 'react';

const StaffReports = () => {
  return (
    <div className="page-container">
      <h1>Reports</h1>
      <p>Generate performance reports, track course completion, and view statistics.</p>

      <div className="reports-sections">
        <div className="section-card">
          <h3>Class Performance Reports</h3>
          <p>Generate detailed performance reports for your classes</p>
          <button className="btn-primary">Generate Report</button>
        </div>

        <div className="section-card">
          <h3>Course Completion Status</h3>
          <p>Track progress and completion of courses</p>
          <button className="btn-primary">View Status</button>
        </div>

        <div className="section-card">
          <h3>Teaching Schedule</h3>
          <p>View your teaching schedule and timetable</p>
          <button className="btn-primary">View Schedule</button>
        </div>

        <div className="section-card">
          <h3>Attendance Statistics</h3>
          <p>View attendance statistics for your courses</p>
          <button className="btn-primary">View Statistics</button>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;

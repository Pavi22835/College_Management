import React from 'react';

const StudentAssignments = () => {
  return (
    <div className="page-container">
      <h1>Assignments & Submissions</h1>
      <p>View pending assignments, submit work, and check your grades.</p>

      <div className="assignments-sections">
        <div className="section-card">
          <h3>Pending Assignments</h3>
          <p>View assignments that need to be submitted</p>
          <button className="btn-primary">View Assignments</button>
        </div>

        <div className="section-card">
          <h3>Submit Assignments</h3>
          <p>Upload your assignment submissions</p>
          <button className="btn-primary">Submit Work</button>
        </div>

        <div className="section-card">
          <h3>Submission Status</h3>
          <p>Check the status of your submissions</p>
          <button className="btn-primary">Check Status</button>
        </div>

        <div className="section-card">
          <h3>Assignment Grades</h3>
          <p>View grades and feedback for completed assignments</p>
          <button className="btn-primary">View Grades</button>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
import React from 'react';

const StaffGrading = () => {
  return (
    <div className="page-container">
      <h1>Grading & Assessment</h1>
      <p>Grade assignments and exams, provide feedback, and calculate GPA/CGPA.</p>

      <div className="grading-sections">
        <div className="section-card">
          <h3>Grade Assignments</h3>
          <p>Review and grade submitted assignments</p>
          <button className="btn-primary">View Assignments</button>
        </div>

        <div className="section-card">
          <h3>Grade Exams</h3>
          <p>Review and grade exam submissions</p>
          <button className="btn-primary">View Exams</button>
        </div>

        <div className="section-card">
          <h3>Provide Feedback</h3>
          <p>Add comments and feedback to student work</p>
          <button className="btn-primary">Add Feedback</button>
        </div>

        <div className="section-card">
          <h3>Calculate GPA/CGPA</h3>
          <p>Compute final grades and GPA</p>
          <button className="btn-primary">Calculate Grades</button>
        </div>
      </div>
    </div>
  );
};

export default StaffGrading;

import React from 'react';

const StudentSchedule = () => {
  return (
    <div className="page-container">
      <h1>Schedule & Timetable</h1>
      <p>View your class schedule, exam timetable, and upcoming deadlines.</p>

      <div className="schedule-sections">
        <div className="section-card">
          <h3>Daily/Weekly Schedule</h3>
          <p>View your class timetable</p>
          <button className="btn-primary">View Schedule</button>
        </div>

        <div className="section-card">
          <h3>Exam Timetable</h3>
          <p>Check upcoming exam dates and times</p>
          <button className="btn-primary">View Exams</button>
        </div>

        <div className="section-card">
          <h3>Upcoming Deadlines</h3>
          <p>See assignment and project deadlines</p>
          <button className="btn-primary">View Deadlines</button>
        </div>

        <div className="section-card">
          <h3>Room/Location Details</h3>
          <p>Find classroom locations and details</p>
          <button className="btn-primary">Find Locations</button>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
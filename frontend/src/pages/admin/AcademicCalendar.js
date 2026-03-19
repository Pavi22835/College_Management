import React, { useState } from 'react';
import './AcademicCalendar.css';

const AcademicCalendar = () => {
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [semesters, setSemesters] = useState([
    {
      id: 1,
      name: 'Semester 1',
      startDate: '2024-06-01',
      endDate: '2024-11-30',
      examStartDate: '2024-11-15',
      examEndDate: '2024-11-30'
    },
    {
      id: 2,
      name: 'Semester 2',
      startDate: '2024-12-01',
      endDate: '2025-05-31',
      examStartDate: '2025-05-15',
      examEndDate: '2025-05-31'
    }
  ]);

  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Independence Day', date: '2024-08-15', type: 'National' },
    { id: 2, name: 'Diwali', date: '2024-11-01', type: 'Festival' },
    { id: 3, name: 'New Year', date: '2025-01-01', type: 'National' }
  ]);

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [semesterForm, setSemesterForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    examStartDate: '',
    examEndDate: ''
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'National'
  });

  const handleAddSemester = () => {
    if (semesterForm.name && semesterForm.startDate && semesterForm.endDate) {
      setSemesters([...semesters, {
        id: Date.now(),
        ...semesterForm
      }]);
      setSemesterForm({
        name: '',
        startDate: '',
        endDate: '',
        examStartDate: '',
        examEndDate: ''
      });
      setShowSemesterModal(false);
    }
  };

  const handleAddHoliday = () => {
    if (holidayForm.name && holidayForm.date) {
      setHolidays([...holidays, {
        id: Date.now(),
        ...holidayForm
      }]);
      setHolidayForm({
        name: '',
        date: '',
        type: 'National'
      });
      setShowHolidayModal(false);
    }
  };

  const handleDeleteSemester = (id) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const handleDeleteHoliday = (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  return (
    <div className="academic-calendar-container">
      <div className="calendar-header">
        <h1>Academic Calendar</h1>
        <div className="year-selector">
          <button onClick={() => setActiveYear(activeYear - 1)}>←</button>
          <span className="year-display">{activeYear}</span>
          <button onClick={() => setActiveYear(activeYear + 1)}>→</button>
        </div>
      </div>

      <div className="calendar-sections">
        {/* Semesters Section */}
        <div className="calendar-section">
          <div className="section-header">
            <h2>Semesters</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowSemesterModal(true)}
            >
              + Add Semester
            </button>
          </div>

          <div className="semesters-list">
            {semesters.length > 0 ? (
              semesters.map((semester) => (
                <div key={semester.id} className="semester-card">
                  <div className="semester-header">
                    <h3>{semester.name}</h3>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDeleteSemester(semester.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="semester-details">
                    <div className="detail-row">
                      <span className="label">Duration:</span>
                      <span className="value">
                        {formatDate(semester.startDate)} to {formatDate(semester.endDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Days:</span>
                      <span className="value">
                        {getDaysInRange(semester.startDate, semester.endDate)} days
                      </span>
                    </div>
                    {semester.examStartDate && (
                      <>
                        <div className="detail-row exam-row">
                          <span className="label">Exam Period:</span>
                          <span className="value">
                            {formatDate(semester.examStartDate)} to {formatDate(semester.examEndDate)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No semesters added yet</p>
            )}
          </div>
        </div>

        {/* Holidays Section */}
        <div className="calendar-section">
          <div className="section-header">
            <h2>Holidays & Important Dates</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowHolidayModal(true)}
            >
              + Add Holiday
            </button>
          </div>

          <div className="holidays-list">
            {holidays.length > 0 ? (
              holidays.map((holiday) => (
                <div key={holiday.id} className="holiday-card">
                  <div className="holiday-date">
                    {formatDate(holiday.date)}
                  </div>
                  <div className="holiday-info">
                    <h4>{holiday.name}</h4>
                    <span className={`badge badge-${holiday.type.toLowerCase()}`}>
                      {holiday.type}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-message">No holidays added yet</p>
            )}
          </div>
        </div>

        {/* Academic Events Timeline */}
        <div className="calendar-section">
          <div className="section-header">
            <h2>Academic Events Timeline</h2>
          </div>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Early Registration</h4>
                <p>Registration opens for next semester courses</p>
                <span className="timeline-date">Usually 2 weeks before semester start</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Late Registration</h4>
                <p>Last date for course registration and fee submission</p>
                <span className="timeline-date">Within 1 week of semester start</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Midterm Exams</h4>
                <p>Mid-semester assessment of students</p>
                <span className="timeline-date">Mid-way through semester</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Final Exams</h4>
                <p>End-semester comprehensive examinations</p>
                <span className="timeline-date">Last 2-3 weeks of semester</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Result Declaration</h4>
                <p>Announcement of final semester results</p>
                <span className="timeline-date">1 week after exams end</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Break Period</h4>
                <p>Semester break between academic sessions</p>
                <span className="timeline-date">Between semesters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Modal */}
      {showSemesterModal && (
        <div className="modal-overlay" onClick={() => setShowSemesterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Semester</h2>
              <button
                className="close-btn"
                onClick={() => setShowSemesterModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Semester Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Semester 1"
                  value={semesterForm.name}
                  onChange={(e) =>
                    setSemesterForm({ ...semesterForm, name: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={semesterForm.startDate}
                    onChange={(e) =>
                      setSemesterForm({ ...semesterForm, startDate: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={semesterForm.endDate}
                    onChange={(e) =>
                      setSemesterForm({ ...semesterForm, endDate: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Exam Start Date</label>
                  <input
                    type="date"
                    value={semesterForm.examStartDate}
                    onChange={(e) =>
                      setSemesterForm({ ...semesterForm, examStartDate: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Exam End Date</label>
                  <input
                    type="date"
                    value={semesterForm.examEndDate}
                    onChange={(e) =>
                      setSemesterForm({ ...semesterForm, examEndDate: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSemesterModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddSemester}>
                Add Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="modal-overlay" onClick={() => setShowHolidayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Holiday/Important Date</h2>
              <button
                className="close-btn"
                onClick={() => setShowHolidayModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Holiday Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Independence Day"
                  value={holidayForm.name}
                  onChange={(e) =>
                    setHolidayForm({ ...holidayForm, name: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={holidayForm.date}
                    onChange={(e) =>
                      setHolidayForm({ ...holidayForm, date: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={holidayForm.type}
                    onChange={(e) =>
                      setHolidayForm({ ...holidayForm, type: e.target.value })
                    }
                    className="form-control"
                  >
                    <option value="National">National Holiday</option>
                    <option value="Festival">Festival</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowHolidayModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddHoliday}>
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;

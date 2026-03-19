import React, { useState, useEffect } from 'react';
import { FiAward, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import  studentApi  from '../../api/studentApi';
import './StudentGrades.css';

const StudentGrades = () => {
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [stats, setStats] = useState({
    cgpa: 0,
    totalCredits: 0,
    rank: 0
  });
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    const safeGrades = Array.isArray(grades) ? grades : [];
    if (selectedSemester === 'all') {
      setFilteredGrades(safeGrades);
    } else {
      const filtered = safeGrades.filter(g => g.semester === parseInt(selectedSemester));
      setFilteredGrades(filtered);
    }
  }, [selectedSemester, grades]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getGrades();
      
      if (response.success) {
        setGrades(response.data.grades);
        setFilteredGrades(response.data.grades);
        setStats(response.data.stats);
        setSemesters(response.data.semesters);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return '#94a3b8';
    if (grade.startsWith('A')) return '#10b981';
    if (grade.startsWith('B')) return '#3b82f6';
    if (grade.startsWith('C')) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading grades...</p></div>;
  if (error) return <div className="error-container"><div className="error-icon">!</div><h3>{error}</h3><button onClick={fetchGrades}>Retry</button></div>;

  return (
    <div className="student-grades">
      <div className="grades-header">
        <div>
          <h1 className="page-title">My Grades</h1>
          <p className="page-subtitle">
            {(Array.isArray(grades) ? grades.length : 0)} graded courses found
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchGrades}>
          <FiRefreshCw size={18} />
        </button>
      </div>

      <div className="gpa-cards">
        <div className="gpa-card">
          <div className="gpa-icon"><FiAward size={24} /></div>
          <div className="gpa-info">
            <span className="gpa-label">Current CGPA</span>
            <div className="gpa-value-wrapper">
              <span className="gpa-value">{typeof stats.cgpa === 'number' ? stats.cgpa.toFixed(2) : '0.00'}</span>
              <span className="gpa-scale">/10.0</span>
            </div>
            <div className="gpa-details">
              <span>Credits: {typeof stats.totalCredits === 'number' ? stats.totalCredits : 0}</span>
              <span>•</span>
              <span>Rank: {typeof stats.rank === 'number' ? stats.rank : 0}</span>
            </div>
          </div>
        </div>

        <div className="gpa-card semester">
          <div className="gpa-icon"><FiTrendingUp size={20} /></div>
          <div className="gpa-info">
            <span className="gpa-label">Filter by Semester</span>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {filteredGrades.length > 0 ? (
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Credits</th>
                <th>Assignments</th>
                <th>Quiz</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((course, index) => (
                <tr key={course.id || index}>
                  <td>
                    <div className="course-cell">
                      <div className="course-name">{course.course}</div>
                      <div className="course-code">{course.code}</div>
                    </div>
                  </td>
                  <td className="credits-cell">{course.credits}</td>
                  <td>{course.assignments}%</td>
                  <td>{course.quiz}%</td>
                  <td>{course.midterm}%</td>
                  <td>{course.final}%</td>
                  <td className="total-cell">{course.total}%</td>
                  <td>
                    <span className="grade-badge" style={{
                      backgroundColor: `${getGradeColor(course.grade)}15`,
                      color: getGradeColor(course.grade)
                    }}>
                      {course.grade}
                    </span>
                  </td>
                  <td className="points-cell">{course.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <FiAward size={48} />
            <h3>No Grades Found</h3>
            <p>No grades available in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
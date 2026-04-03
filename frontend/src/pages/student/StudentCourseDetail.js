import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  FileText,
  Download,
  Play,
  CheckCircle,
  ArrowLeft,
  Calendar,
  User,
  Award,
  AlertCircle,
  ChevronRight,
  Upload,
  MessageSquare
} from 'lucide-react';
import studentApi from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';
import './StudentCourseDetail.css';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get course details from enrolled courses
      const coursesResponse = await studentApi.getCourses();
      if (coursesResponse.success && coursesResponse.data) {
        const enrolledCourse = coursesResponse.data.find(c => c.id === parseInt(courseId));
        if (enrolledCourse) {
          // Get detailed course info including lessons/materials
          const courseDetailResponse = await studentApi.getCourseDetail(courseId);
          if (courseDetailResponse.success) {
            setCourse({
              ...enrolledCourse,
              ...courseDetailResponse.data,
              lessons: courseDetailResponse.data.materials || [],
              materials: courseDetailResponse.data.materials || [],
              assignments: courseDetailResponse.data.assignments || []
            });
          } else {
            setCourse(enrolledCourse);
          }
        } else {
          setError('You are not enrolled in this course');
        }
      } else {
        setError('Failed to load course details');
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return '#10b981';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="scd-loading-container">
        <div className="scd-loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="scd-error-container">
        <AlertCircle size={32} />
        <h3>Course Not Found</h3>
        <p>{error || 'The requested course could not be found.'}</p>
        <button className="scd-back-btn" onClick={() => navigate('/student/courses')}>
          <ArrowLeft size={16} /> Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="student-course-detail">
      {/* Header */}
      <div className="scd-header">
        <button className="scd-back-button" onClick={() => navigate('/student/courses')}>
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>

        <div className="scd-course-info">
          <div className="scd-course-badge">{course.code}</div>
          <div className="scd-course-meta">
            <h1 className="scd-course-title">{course.title}</h1>
            <div className="scd-course-details">
              <span className="scd-instructor">
                <User size={16} />
                {course.instructor}
              </span>
              <span className="scd-credits">
                <Award size={16} />
                {course.credits} Credits
              </span>
              <span className="scd-semester">
                <Calendar size={16} />
                Semester {course.semester}
              </span>
            </div>
          </div>
        </div>

        <div className="scd-progress-section">
          <div className="scd-progress-info">
            <span className="scd-progress-label">Progress</span>
            <span className="scd-progress-value" style={{ color: getProgressColor(course.progress) }}>
              {course.progress}%
            </span>
          </div>
          <div className="scd-progress-bar">
            <div
              className="scd-progress-fill"
              style={{
                width: `${course.progress}%`,
                backgroundColor: getProgressColor(course.progress)
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="scd-tabs">
        <button
          className={`scd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`scd-tab ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          Lessons ({course.lessons?.length || 0})
        </button>
        <button
          className={`scd-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materials ({course.materials?.length || 0})
        </button>
        <button
          className={`scd-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({course.assignments?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="scd-content">
        {activeTab === 'overview' && (
          <div className="scd-overview">
            <div className="scd-overview-grid">
              <div className="scd-overview-card">
                <h3>Course Description</h3>
                <p>{course.description || 'No description available.'}</p>
              </div>

              <div className="scd-overview-card">
                <h3>Course Statistics</h3>
                <div className="scd-stats-grid">
                  <div className="scd-stat">
                    <BookOpen size={20} />
                    <div>
                      <span className="scd-stat-value">{course.lessons?.length || 0}</span>
                      <span className="scd-stat-label">Lessons</span>
                    </div>
                  </div>
                  <div className="scd-stat">
                    <FileText size={20} />
                    <div>
                      <span className="scd-stat-value">{course.materials?.length || 0}</span>
                      <span className="scd-stat-label">Materials</span>
                    </div>
                  </div>
                  <div className="scd-stat">
                    <Upload size={20} />
                    <div>
                      <span className="scd-stat-value">{course.assignments?.length || 0}</span>
                      <span className="scd-stat-label">Assignments</span>
                    </div>
                  </div>
                  <div className="scd-stat">
                    <CheckCircle size={20} />
                    <div>
                      <span className="scd-stat-value">{course.attendance}%</span>
                      <span className="scd-stat-label">Attendance</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scd-overview-card">
                <h3>Schedule & Location</h3>
                <div className="scd-schedule-info">
                  <p><strong>Schedule:</strong> {course.schedule || 'Not specified'}</p>
                  <p><strong>Room:</strong> {course.room || 'Not specified'}</p>
                  <p><strong>Batch:</strong> {course.batch || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="scd-lessons">
            <h3>Course Lessons</h3>
            {course.lessons && course.lessons.length > 0 ? (
              <div className="scd-lessons-grid">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson.id || index} className="scd-lesson-card">
                    <div className="scd-lesson-header">
                      <div className="scd-lesson-number">{index + 1}</div>
                      <h4 className="scd-lesson-title">{lesson.title}</h4>
                      <span className="scd-lesson-duration">
                        <Clock size={14} />
                        {lesson.duration || '30 mins'}
                      </span>
                    </div>
                    {lesson.description && (
                      <p className="scd-lesson-description">{lesson.description}</p>
                    )}
                    <div className="scd-lesson-actions">
                      <button className="scd-lesson-btn">
                        <Play size={16} />
                        Start Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scd-empty-state">
                <BookOpen size={48} />
                <h4>No lessons available</h4>
                <p>Lessons will be added by your instructor soon.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="scd-materials">
            <h3>Course Materials</h3>
            {course.materials && course.materials.length > 0 ? (
              <div className="scd-materials-grid">
                {course.materials.map((material, index) => (
                  <div key={material.id || index} className="scd-material-card">
                    <div className="scd-material-icon">
                      <FileText size={24} />
                    </div>
                    <div className="scd-material-info">
                      <h4 className="scd-material-title">{material.title || `Material ${index + 1}`}</h4>
                      <p className="scd-material-description">{material.description || 'Course material'}</p>
                    </div>
                    <button className="scd-download-btn">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scd-empty-state">
                <FileText size={48} />
                <h4>No materials available</h4>
                <p>Materials will be uploaded by your instructor soon.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="scd-assignments">
            <h3>Course Assignments</h3>
            {course.assignments && course.assignments.length > 0 ? (
              <div className="scd-assignments-list">
                {course.assignments.map((assignment, index) => (
                  <div key={assignment.id || index} className="scd-assignment-card">
                    <div className="scd-assignment-header">
                      <h4 className="scd-assignment-title">{assignment.title || `Assignment ${index + 1}`}</h4>
                      <span className="scd-assignment-status">Pending</span>
                    </div>
                    <p className="scd-assignment-description">{assignment.description || 'Assignment description'}</p>
                    <div className="scd-assignment-meta">
                      <span className="scd-due-date">
                        <Calendar size={14} />
                        Due: {assignment.dueDate || 'Not specified'}
                      </span>
                      <span className="scd-points">
                        <Award size={14} />
                        {assignment.points || 0} points
                      </span>
                    </div>
                    <div className="scd-assignment-actions">
                      <button className="scd-submit-btn">
                        <Upload size={16} />
                        Submit Assignment
                      </button>
                      <button className="scd-discuss-btn">
                        <MessageSquare size={16} />
                        Discuss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scd-empty-state">
                <Upload size={48} />
                <h4>No assignments available</h4>
                <p>Assignments will be posted by your instructor soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetail;
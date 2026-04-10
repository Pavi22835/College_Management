import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineChartBar,
  HiOutlineChevronRight, HiOutlineSearch, HiOutlineChevronLeft,
  HiOutlineDocument, HiOutlineVideoCamera, HiOutlineDownload,
  HiOutlineEye, HiOutlineX, HiOutlinePlay
} from 'react-icons/hi';
import studentApi from '../../api/studentApi';
import courseApi from '../../api/courseApi';
import './StudentCourses.css';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('semesters');
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [coursePlanData, setCoursePlanData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjectsBySemester(selectedSemester);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      fetchCoursePlan(selectedSubject.id);
      setActiveView('coursePlan');
    }
  }, [selectedSubject]);

  // Fetch enrolled courses for the student
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getCourses();
      
      let coursesData = [];
      if (response?.success && response?.data) {
        coursesData = response.data;
      } else if (Array.isArray(response)) {
        coursesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        coursesData = response.data;
      }
      
      setAllCourses(coursesData);
      
      // Extract unique semesters from courses
      const uniqueSemesters = [...new Set(coursesData.map(c => c.semester).filter(Boolean))];
      setSemesters(uniqueSemesters.sort((a, b) => a - b));
      
      // Fetch progress for each course
      const progressMap = {};
      for (const course of coursesData) {
        try {
          const attendanceResponse = await studentApi.getAttendance({ courseId: course.id });
          if (attendanceResponse?.success && attendanceResponse?.data) {
            const total = attendanceResponse.data.stats?.total || 0;
            const present = attendanceResponse.data.stats?.present || 0;
            progressMap[course.id] = total > 0 ? Math.round((present / total) * 100) : 0;
          }
        } catch (err) {
          console.warn(`Could not fetch progress for course ${course.id}`);
          progressMap[course.id] = course.progress || 0;
        }
      }
      setCourseProgress(progressMap);
      
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get courses for selected semester
  const fetchSubjectsBySemester = async (semester) => {
    try {
      const semesterCourses = allCourses.filter(c => c.semester === semester);
      const coursesWithProgress = semesterCourses.map(course => ({
        ...course,
        progress: courseProgress[course.id] || course.progress || 0
      }));
      setSubjects(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch course plan data (units, topics, materials, videos) for a subject
  const fetchCoursePlan = async (courseId) => {
    try {
      setLoading(true);
      
      // Fetch lessons/topics for the course
      const lessonsResponse = await courseApi.getLessons(courseId);
      let lessons = [];
      if (lessonsResponse?.success && lessonsResponse?.data) {
        lessons = lessonsResponse.data;
      } else if (Array.isArray(lessonsResponse)) {
        lessons = lessonsResponse;
      } else if (lessonsResponse?.data && Array.isArray(lessonsResponse.data)) {
        lessons = lessonsResponse.data;
      }

      // For each lesson, fetch its materials
      const coursePlan = [];
      
      for (const lesson of lessons) {
        // Fetch materials for this lesson
        const materialsResponse = await courseApi.getMaterialsByLesson(lesson.id);
        let materials = [];
        if (materialsResponse?.success && materialsResponse?.data) {
          materials = materialsResponse.data;
        } else if (Array.isArray(materialsResponse)) {
          materials = materialsResponse;
        } else if (materialsResponse?.data && Array.isArray(materialsResponse.data)) {
          materials = materialsResponse.data;
        }

        // Separate PDF/documents and videos
        const lectureMaterials = materials.filter(m => 
          m.type === 'pdf' || m.type === 'document' || m.type === 'docx' || 
          (m.fileName && (m.fileName.endsWith('.pdf') || m.fileName.endsWith('.doc') || m.fileName.endsWith('.docx')))
        );
        
        const lectureVideos = materials.filter(m => 
          m.type === 'video' || (m.fileName && (m.fileName.endsWith('.mp4') || m.fileName.endsWith('.webm') || m.fileName.endsWith('.mov')))
        );

        // Calculate total hours (you can adjust this logic based on your data)
        const hoursRequired = lesson.duration ? Math.ceil(parseInt(lesson.duration) / 60) : 1;
        
        coursePlan.push({
          id: lesson.id,
          unitNo: lesson.unitNo || lesson.unit_number || 1,
          topic: lesson.title,
          lectureMaterial: lectureMaterials.length > 0 ? lectureMaterials[0] : null,
          lectureMaterialsList: lectureMaterials,
          lectureVideo: lectureVideos.length > 0 ? lectureVideos[0] : null,
          lectureVideosList: lectureVideos,
          hoursRequired: hoursRequired,
          totalHours: lesson.totalHours || null,
          order: lesson.order || lesson.display_order || 0
        });
      }

      // Sort by unit number and order
      coursePlan.sort((a, b) => {
        if (a.unitNo !== b.unitNo) return a.unitNo - b.unitNo;
        return a.order - b.order;
      });

      setCoursePlanData(coursePlan);
    } catch (error) {
      console.error('Error fetching course plan:', error);
      setCoursePlanData([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return '#10b981';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setActiveView('subjects');
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleMaterialClick = (material) => {
    setSelectedMaterial(material);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleBack = () => {
    if (activeView === 'coursePlan') {
      setActiveView('subjects');
      setSelectedSubject(null);
      setCoursePlanData([]);
    } else if (activeView === 'subjects') {
      setActiveView('semesters');
      setSelectedSemester(null);
      setSubjects([]);
    }
  };

  const handleCloseModal = () => {
    setSelectedMaterial(null);
    setSelectedVideo(null);
  };

  const filteredSemesters = semesters.filter(s => s.toString().includes(searchTerm));
  const filteredSubjects = subjects.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter course plan data by search term
  const filteredCoursePlan = coursePlanData.filter(item => 
    item.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group course plan data by unit
  const groupedCoursePlan = filteredCoursePlan.reduce((acc, item) => {
    if (!acc[item.unitNo]) {
      acc[item.unitNo] = [];
    }
    acc[item.unitNo].push(item);
    return acc;
  }, {});

  // Sort units
  const sortedUnits = Object.keys(groupedCoursePlan).sort((a, b) => a - b);

  if (loading && activeView === 'semesters') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your enrolled courses...</p>
      </div>
    );
  }

  // ==================== SEMESTER CARDS VIEW ====================
  if (activeView === 'semesters') {
    return (
      <div className="student-courses">
        <div className="courses-header">
          <div>
            <h1 className="header-title">My Courses</h1>
            <p className="header-subtitle">Select a semester to view your enrolled courses</p>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search semesters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {semesters.length === 0 ? (
          <div className="no-data-message">
            <HiOutlineBookOpen size={48} />
            <p>You are not enrolled in any courses yet</p>
            <p className="hint">Contact your administrator to enroll in courses</p>
          </div>
        ) : (
          <div className="semester-cards-grid">
            {filteredSemesters.map(semester => {
              const semesterCourses = allCourses.filter(c => c.semester === semester);
              const totalCredits = semesterCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
              const avgProgress = semesterCourses.length > 0 
                ? Math.round(semesterCourses.reduce((sum, c) => sum + (courseProgress[c.id] || c.progress || 0), 0) / semesterCourses.length)
                : 0;
              
              return (
                <div 
                  key={semester} 
                  className="semester-card"
                  onClick={() => handleSemesterClick(semester)}
                >
                  <div className="semester-card-header">
                    <div className="semester-number">Semester {semester}</div>
                    <div className="semester-arrow-icon">
                      <HiOutlineChevronRight />
                    </div>
                  </div>
                  <div className="semester-card-stats">
                    <div className="stat">
                      <HiOutlineBookOpen />
                      <span>{semesterCourses.length} Courses</span>
                    </div>
                    <div className="stat">
                      <HiOutlineAcademicCap />
                      <span>{totalCredits} Credits</span>
                    </div>
                  </div>
                  <div className="semester-progress">
                    <div className="progress-label">Overall Progress</div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${avgProgress}%`, backgroundColor: getProgressColor(avgProgress) }} />
                    </div>
                    <div className="progress-percentage">{avgProgress}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredSemesters.length === 0 && semesters.length > 0 && (
          <div className="no-data-message">
            <p>No semesters match your search</p>
          </div>
        )}
      </div>
    );
  }

  // ==================== SUBJECTS TABLE VIEW ====================
  if (activeView === 'subjects') {
    return (
      <div className="student-courses">
        <div className="courses-header">
          <button className="back-btn" onClick={handleBack}>
            <HiOutlineChevronLeft /> Back to Semesters
          </button>
          <div>
            <h1 className="header-title">Semester {selectedSemester} - Subjects</h1>
            <p className="header-subtitle">{subjects.length} courses enrolled in this semester</p>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Subject Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map(subject => (
                  <tr key={subject.id} onClick={() => handleSubjectClick(subject)}>
                    <td className="code-cell">{subject.code}</td>
                    <td className="name-cell">{subject.name}</td>
                    <td>
                      <button className="view-btn">
                        View Course Plan <HiOutlineChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data-cell">
                    No subjects found for Semester {selectedSemester}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== COURSE PLAN VIEW (Real Data) ====================
  if (activeView === 'coursePlan') {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course plan...</p>
        </div>
      );
    }

    return (
      <div className="student-courses">
        <div className="courses-header">
          <button className="back-btn" onClick={handleBack}>
            <HiOutlineChevronLeft /> Back to Subjects
          </button>
          <div>
            <h1 className="header-title">{selectedSubject?.name} - Course Plan</h1>
            <p className="header-subtitle">{selectedSubject?.code}</p>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {coursePlanData.length === 0 ? (
          <div className="no-data-message">
            <HiOutlineDocument size={48} />
            <p>No course plan available for this subject</p>
            <p className="hint">Topics and materials will appear here once added</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table course-plan-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Unit No.</th>
                  <th>Topic</th>
                  <th style={{ width: '200px' }}>Lecture Material</th>
                  <th style={{ width: '200px' }}>Lecture Video</th>
                  <th style={{ width: '120px' }}>No. of Hours</th>
                  <th style={{ width: '100px' }}>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {sortedUnits.map(unitNo => (
                  groupedCoursePlan[unitNo].map((item, idx) => (
                    <tr key={item.id}>
                      {idx === 0 && (
                        <td rowSpan={groupedCoursePlan[unitNo].length} className="unit-cell">
                          Unit {unitNo}
                        </td>
                      )}
                      <td className="topic-cell">{item.topic}</td>
                      <td>
                        {item.lectureMaterial ? (
                          <button 
                            className="material-link-btn"
                            onClick={() => handleMaterialClick(item.lectureMaterial)}
                          >
                            <HiOutlineDocument size={16} />
                            <span>{item.lectureMaterial.title || item.lectureMaterial.fileName || 'Lecture Material'}</span>
                          </button>
                        ) : item.lectureMaterialsList && item.lectureMaterialsList.length > 0 ? (
                          <div className="materials-list">
                            {item.lectureMaterialsList.slice(0, 2).map(mat => (
                              <button 
                                key={mat.id}
                                className="material-link-btn"
                                onClick={() => handleMaterialClick(mat)}
                              >
                                <HiOutlineDocument size={16} />
                                <span>{mat.title || mat.fileName || 'Material'}</span>
                              </button>
                            ))}
                            {item.lectureMaterialsList.length > 2 && (
                              <span className="more-materials">+{item.lectureMaterialsList.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="no-material">No material available</span>
                        )}
                      </td>
                      <td>
                        {item.lectureVideo ? (
                          <button 
                            className="material-link-btn video-link"
                            onClick={() => handleVideoClick(item.lectureVideo)}
                          >
                            <HiOutlinePlay size={16} />
                            <span>{item.lectureVideo.title || item.lectureVideo.fileName || 'Lecture Video'}</span>
                          </button>
                        ) : item.lectureVideosList && item.lectureVideosList.length > 0 ? (
                          <div className="videos-list">
                            {item.lectureVideosList.slice(0, 2).map(video => (
                              <button 
                                key={video.id}
                                className="material-link-btn video-link"
                                onClick={() => handleVideoClick(video)}
                              >
                                <HiOutlinePlay size={16} />
                                <span>{video.title || video.fileName || 'Video'}</span>
                              </button>
                            ))}
                            {item.lectureVideosList.length > 2 && (
                              <span className="more-materials">+{item.lectureVideosList.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="no-material">No video available</span>
                        )}
                      </td>
                      <td className="hours-cell">{item.hoursRequired}</td>
                      <td className="hours-cell">{item.totalHours || '-'}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ==================== MATERIAL PREVIEW MODAL ====================
  if (selectedMaterial) {
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="material-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedMaterial.title || selectedMaterial.fileName || 'Material Preview'}</h2>
            <button className="close-modal" onClick={handleCloseModal}>
              <HiOutlineX size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="material-preview">
              <div className="material-details">
                <p><strong>Type:</strong> {(selectedMaterial.type || selectedMaterial.fileName?.split('.').pop() || 'document').toUpperCase()}</p>
                <p><strong>Size:</strong> {selectedMaterial.size || '1 MB'}</p>
                <p><strong>Uploaded:</strong> {selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
              <div className="preview-area">
                {(selectedMaterial.type === 'pdf' || selectedMaterial.fileName?.endsWith('.pdf')) && (
                  <iframe 
                    src={selectedMaterial.url || selectedMaterial.fileUrl} 
                    title={selectedMaterial.title}
                    className="pdf-preview"
                    frameBorder="0"
                  />
                )}
                {(selectedMaterial.type === 'video' || selectedMaterial.fileName?.match(/\.(mp4|webm|mov)$/i)) && (
                  <video controls className="video-preview">
                    <source src={selectedMaterial.url || selectedMaterial.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {(!selectedMaterial.type || (!selectedMaterial.type?.match(/pdf|video/i) && !selectedMaterial.fileName?.match(/\.(pdf|mp4|webm|mov)$/i))) && (
                  <div className="document-preview">
                    <HiOutlineDocument size={64} />
                    <p>Click download to view this file</p>
                    <button className="download-large-btn" onClick={() => window.open(selectedMaterial.url || selectedMaterial.fileUrl, '_blank')}>
                      <HiOutlineDownload size={20} /> Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="close-btn" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VIDEO PREVIEW MODAL ====================
  if (selectedVideo) {
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="video-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedVideo.title || selectedVideo.fileName || 'Video Preview'}</h2>
            <button className="close-modal" onClick={handleCloseModal}>
              <HiOutlineX size={20} />
            </button>
          </div>
          <div className="modal-body">
            <video controls autoPlay className="video-preview-full">
              <source src={selectedVideo.url || selectedVideo.fileUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="modal-footer">
            <button className="close-btn" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentCourses;
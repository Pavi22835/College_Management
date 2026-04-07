import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineChartBar,
  HiOutlineChevronRight, HiOutlineSearch, HiOutlineChevronLeft,
  HiOutlineDocument, HiOutlineVideoCamera, HiOutlineDownload,
  HiOutlineEye, HiOutlineX, HiOutlineFilter
} from 'react-icons/hi';
import studentApi from '../../api/studentApi';
import './StudentCourses.css';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('semesters'); // semesters, subjects, topics, materials
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjectsBySemester(selectedSemester);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopicsBySubject(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      fetchMaterialsByTopic(selectedTopic);
    }
  }, [selectedTopic]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getCourses();
      if (response.success) {
        setCourses(response.data);
        const uniqueSemesters = [...new Set(response.data.map(c => c.semester).filter(Boolean))];
        setSemesters(uniqueSemesters.sort((a, b) => a - b));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Demo data for testing
      setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      setCourses([
        { id: 1, code: 'CS101', name: 'Data Structures', semester: 3, credits: 3, instructor: 'Dr. Smith', progress: 75 },
        { id: 2, code: 'CS102', name: 'Algorithms', semester: 3, credits: 3, instructor: 'Prof. Johnson', progress: 60 },
        { id: 3, code: 'CS103', name: 'Operating Systems', semester: 3, credits: 4, instructor: 'Dr. Brown', progress: 45 },
        { id: 4, code: 'CS201', name: 'Database Systems', semester: 4, credits: 4, instructor: 'Dr. Williams', progress: 80 },
        { id: 5, code: 'CS202', name: 'Computer Networks', semester: 4, credits: 3, instructor: 'Prof. Davis', progress: 55 },
        { id: 6, code: 'CS203', name: 'Software Engineering', semester: 4, credits: 3, instructor: 'Dr. Miller', progress: 70 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsBySemester = async (semester) => {
    try {
      const semesterCourses = courses.filter(c => c.semester === semester);
      setSubjects(semesterCourses);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTopicsBySubject = async (subject) => {
    try {
      // Demo topics data
      setTopics([
        { id: 1, title: 'Introduction to ' + subject.name, order: 1, duration: '45 mins', isCompleted: true, materialsCount: 3 },
        { id: 2, title: 'Core Concepts', order: 2, duration: '60 mins', isCompleted: true, materialsCount: 2 },
        { id: 3, title: 'Advanced Topics', order: 3, duration: '50 mins', isCompleted: false, materialsCount: 4 },
        { id: 4, title: 'Practical Implementation', order: 4, duration: '55 mins', isCompleted: false, materialsCount: 2 },
        { id: 5, title: 'Review and Assessment', order: 5, duration: '70 mins', isCompleted: false, materialsCount: 1 },
      ]);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchMaterialsByTopic = async (topic) => {
    try {
      // Demo materials data
      setMaterials([
        { id: 1, title: 'Lecture Notes.pdf', type: 'pdf', size: '2.5 MB', url: '#', uploadedAt: '2024-03-15' },
        { id: 2, title: 'Video Tutorial.mp4', type: 'video', size: '45 MB', url: '#', uploadedAt: '2024-03-14' },
        { id: 3, title: 'Assignment.docx', type: 'document', size: '1.2 MB', url: '#', uploadedAt: '2024-03-13' },
        { id: 4, title: 'Code Examples.zip', type: 'zip', size: '3.8 MB', url: '#', uploadedAt: '2024-03-12' },
        { id: 5, title: 'Reference Guide.pdf', type: 'pdf', size: '1.1 MB', url: '#', uploadedAt: '2024-03-10' },
      ]);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const getMaterialIcon = (type) => {
    switch(type) {
      case 'pdf': return <HiOutlineDocument />;
      case 'video': return <HiOutlineVideoCamera />;
      default: return <HiOutlineDocument />;
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
    setActiveView('topics');
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setActiveView('materials');
  };

  const handleMaterialClick = (material) => {
    setSelectedMaterial(material);
  };

  const handleBack = () => {
    if (activeView === 'materials') {
      setActiveView('topics');
      setSelectedTopic(null);
      setMaterials([]);
    } else if (activeView === 'topics') {
      setActiveView('subjects');
      setSelectedSubject(null);
      setTopics([]);
    } else if (activeView === 'subjects') {
      setActiveView('semesters');
      setSelectedSemester(null);
      setSubjects([]);
    }
  };

  const handleCloseModal = () => {
    setSelectedMaterial(null);
  };

  const filteredSemesters = semesters.filter(s => s.toString().includes(searchTerm));
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // ==================== SEMESTERS TABLE VIEW ====================
  if (activeView === 'semesters') {
    return (
      <div className="student-courses">
        <div className="courses-header">
          <div>
            <h1 className="header-title">My Courses</h1>
            <p className="header-subtitle">Select a semester to view subjects</p>
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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total Courses</th>
                <th>Credits</th>
                <th>Average Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSemesters.map(semester => {
                const semesterCourses = courses.filter(c => c.semester === semester);
                const totalCredits = semesterCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
                const avgProgress = semesterCourses.length > 0 
                  ? Math.round(semesterCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / semesterCourses.length)
                  : 0;
                
                return (
                  <tr key={semester} onClick={() => handleSemesterClick(semester)}>
                    <td className="semester-cell">
                      <span className="semester-badge">Semester {semester}</span>
                    </td>
                    <td>{semesterCourses.length} Courses</td>
                    <td>{totalCredits} Credits</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-track-small">
                          <div className="progress-fill-small" style={{ width: `${avgProgress}%`, backgroundColor: getProgressColor(avgProgress) }} />
                        </div>
                        <span className="progress-text">{avgProgress}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="view-btn">
                        View Subjects <HiOutlineChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
            <p className="header-subtitle">{subjects.length} courses in this semester</p>
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
                <th>Credits</th>
                <th>Instructor</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map(subject => (
                <tr key={subject.id} onClick={() => handleSubjectClick(subject)}>
                  <td className="code-cell">{subject.code}</td>
                  <td className="name-cell">{subject.name}</td>
                  <td>{subject.credits || 3}</td>
                  <td>{subject.instructor || 'Not Assigned'}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-track-small">
                        <div className="progress-fill-small" style={{ width: `${subject.progress || 0}%`, backgroundColor: getProgressColor(subject.progress || 0) }} />
                      </div>
                      <span className="progress-text">{subject.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="view-btn">
                      View Topics <HiOutlineChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== TOPICS TABLE VIEW ====================
  if (activeView === 'topics') {
    const completedCount = topics.filter(t => t.isCompleted).length;
    const totalCount = topics.length;
    const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="student-courses">
        <div className="courses-header">
          <button className="back-btn" onClick={handleBack}>
            <HiOutlineChevronLeft /> Back to Subjects
          </button>
          <div>
            <h1 className="header-title">{selectedSubject?.name} - Topics</h1>
            <p className="header-subtitle">{selectedSubject?.code} • {selectedSubject?.credits} Credits</p>
          </div>
        </div>

        <div className="progress-summary-bar">
          <div className="summary-stats">
            <span>📚 Total Topics: {totalCount}</span>
            <span>✅ Completed: {completedCount}</span>
            <span>📈 Progress: {overallProgress}%</span>
          </div>
          <div className="progress-bar-large">
            <div className="progress-fill-large" style={{ width: `${overallProgress}%` }} />
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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Topic Title</th>
                <th style={{ width: '100px' }}>Duration</th>
                <th style={{ width: '100px' }}>Materials</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map(topic => (
                <tr key={topic.id} onClick={() => handleTopicClick(topic)}>
                  <td className="order-cell">{topic.order}</td>
                  <td className="title-cell">{topic.title}</td>
                  <td className="duration-cell">
                    <HiOutlineClock size={14} />
                    <span>{topic.duration}</span>
                  </td>
                  <td>{topic.materialsCount} files</td>
                  <td>
                    <span className={`topic-status ${topic.isCompleted ? 'completed' : 'pending'}`}>
                      {topic.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn">
                      View Materials <HiOutlineChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== MATERIALS TABLE VIEW ====================
  if (activeView === 'materials') {
    return (
      <div className="student-courses">
        <div className="courses-header">
          <button className="back-btn" onClick={handleBack}>
            <HiOutlineChevronLeft /> Back to Topics
          </button>
          <div>
            <h1 className="header-title">{selectedTopic?.title}</h1>
            <p className="header-subtitle">Course Materials and Resources</p>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search materials..."
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
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map(material => (
                <tr key={material.id}>
                  <td className="material-name-cell">
                    <span className="material-icon-small">{getMaterialIcon(material.type)}</span>
                    {material.title}
                  </td>
                  <td>
                    <span className={`type-badge ${material.type}`}>{material.type.toUpperCase()}</span>
                  </td>
                  <td>{material.size}</td>
                  <td>{material.uploadedAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleMaterialClick(material)}>
                        <HiOutlineEye size={14} /> Preview
                      </button>
                      <button className="action-btn download" onClick={() => window.open(material.url, '_blank')}>
                        <HiOutlineDownload size={14} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== MATERIAL PREVIEW MODAL ====================
  if (selectedMaterial) {
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="material-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedMaterial.title}</h2>
            <button className="close-modal" onClick={handleCloseModal}>
              <HiOutlineX size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="material-preview">
              <div className="material-details">
                <p><strong>Type:</strong> {selectedMaterial.type.toUpperCase()}</p>
                <p><strong>Size:</strong> {selectedMaterial.size}</p>
                <p><strong>Uploaded:</strong> {selectedMaterial.uploadedAt}</p>
              </div>
              <div className="preview-area">
                {selectedMaterial.type === 'pdf' && (
                  <iframe 
                    src={selectedMaterial.url} 
                    title={selectedMaterial.title}
                    className="pdf-preview"
                  />
                )}
                {selectedMaterial.type === 'video' && (
                  <video controls className="video-preview">
                    <source src={selectedMaterial.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {(selectedMaterial.type === 'document' || selectedMaterial.type === 'zip') && (
                  <div className="document-preview">
                    <HiOutlineDocument size={64} />
                    <p>Click download to view this file</p>
                    <button className="download-large-btn" onClick={() => window.open(selectedMaterial.url, '_blank')}>
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

  return null;
};

export default StudentCourses;
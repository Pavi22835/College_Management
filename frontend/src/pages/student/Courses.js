import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineChartBar,
  HiOutlineChevronRight, HiOutlineSearch, HiOutlineChevronLeft,
  HiOutlineDocument, HiOutlineVideoCamera, HiOutlineDownload,
  HiOutlineEye, HiOutlineX, HiOutlinePlay, HiOutlineExternalLink
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
  const [pdfViewerFailed, setPdfViewerFailed] = useState(false);
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
      const uniqueSemesters = [...new Set(coursesData.map(c => c.studentSemester || c.semester).filter(Boolean))];
      setSemesters(uniqueSemesters.sort((a, b) => a - b));
      
      // Normalize course semesters to student semester when available
      coursesData = coursesData.map(course => ({
        ...course,
        semester: course.studentSemester || course.semester
      }));

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

      const courseResponse = await studentApi.getCourseDetail(courseId);
      if (!courseResponse?.success || !courseResponse?.data) {
        setCoursePlanData([]);
        return;
      }

      const lessons = courseResponse.data.lessons || [];
      console.log('=== COURSE PLAN DEBUG ===');
      console.log('Total lessons:', lessons.length);
      console.log('Full lessons data:', JSON.stringify(lessons, null, 2));
      
      const coursePlan = lessons.map((lesson, lessonIndex) => {
        const materials = Array.isArray(lesson.materials) ? lesson.materials : [];
        const topics = Array.isArray(lesson.topics) ? lesson.topics : (Array.isArray(lesson.subjects) ? lesson.subjects : []);

        const lectureMaterials = materials.filter(m => 
          m.type === 'pdf' || m.type === 'document' || m.type === 'docx' || 
          (m.fileName && (m.fileName.endsWith('.pdf') || m.fileName.endsWith('.doc') || m.fileName.endsWith('.docx')))
        );

        const lectureVideos = materials.filter(m => 
          m.type === 'video' || (m.fileName && (m.fileName.endsWith('.mp4') || m.fileName.endsWith('.webm') || m.fileName.endsWith('.mov')))
        );

        const hoursRequired = lesson.duration ? Math.ceil(parseInt(lesson.duration) / 60) : 1;
        const unitNo = typeof lesson.unitNo !== 'undefined'
          ? lesson.unitNo
          : typeof lesson.order === 'number'
          ? lesson.order + 1
          : lessonIndex + 1;

        return {
          id: lesson.id,
          unitNo,
          topic: lesson.title,
          topics,
          lectureMaterial: lectureMaterials.length > 0 ? lectureMaterials[0] : null,
          lectureMaterialsList: lectureMaterials,
          lectureVideo: lectureVideos.length > 0 ? lectureVideos[0] : null,
          lectureVideosList: lectureVideos,
          duration: lesson.duration || '30 mins',
          description: lesson.description || '',
          order: lesson.order || lesson.display_order || 0
        };
      });

      coursePlan.sort((a, b) => {
        if (a.unitNo !== b.unitNo) return a.unitNo - b.unitNo;
        return a.order - b.order;
      });

      console.log('=== FINAL COURSE PLAN ===');
      console.log('Course plan items:', coursePlan.length);
      console.log('Course plan data:', JSON.stringify(coursePlan, null, 2));

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

  const findTopicMaterial = (topic) => {
    if (!topic?.materials?.length) return null;
    const material = topic.materials.find(m => 
      m.type === 'pdf' ||
      m.type === 'document' ||
      m.type === 'docx' ||
      m.type === 'application/pdf' ||
      m.fileType === 'application/pdf' ||
      (m.fileName && /\.(pdf|doc|docx)$/i.test(m.fileName))
    );
    console.log('findTopicMaterial for topic:', topic.title, 'found:', material);
    return material || null;
  };

  const findTopicVideo = (topic) => {
    if (!topic?.materials?.length) return null;
    const video = topic.materials.find(m => 
      m.type === 'video' ||
      m.type === 'video/mp4' ||
      m.fileType === 'video/mp4' ||
      m.fileType?.startsWith('video/') ||
      (m.fileName && /\.(mp4|webm|mov)$/i.test(m.fileName))
    );
    console.log('findTopicVideo for topic:', topic.title, 'found:', video);
    return video || null;
  };

  const normalizeMaterialUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    
    // Create URL properly to handle special characters
    let fullPath = path;
    if (!path.startsWith('/')) {
      fullPath = `/${path}`;
    }
    
    try {
      const url = new URL(`http://localhost:3003${fullPath}`);
      return url.toString();
    } catch (e) {
      console.warn('URL constructor failed, attempting manual construction:', e);
      // Fallback: manual URL encoding
      if (path.startsWith('/')) {
        return `http://localhost:3003${path}`;
      }
      return `http://localhost:3003/${path}`;
    }
  };

  const getFileExtension = (fileNameOrPath) => {
    if (!fileNameOrPath) return '';
    const match = fileNameOrPath.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/);
    return match ? match[1] : '';
  };

  const getVideoMimeType = (fileNameOrPath) => {
    const ext = getFileExtension(fileNameOrPath);
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mov') return 'video/quicktime';
    return 'video/mp4';
  };

  const getMaterialUrl = (material) => {
    if (!material) {
      console.warn('getMaterialUrl: material is null/undefined');
      return null;
    }
    
    console.log('getMaterialUrl - checking fields:', {
      hasUrl: !!material.url,
      hasFileUrl: !!material.fileUrl,
      hasFilePath: !!material.filePath,
      hasFileName: !!material.fileName,
      url: material.url,
      fileUrl: material.fileUrl,
      filePath: material.filePath,
      fileName: material.fileName
    });

    if (material.url) {
      const normalized = normalizeMaterialUrl(material.url);
      console.log('Using material.url, normalized to:', normalized);
      return normalized;
    }
    if (material.fileUrl) {
      const normalized = normalizeMaterialUrl(material.fileUrl);
      console.log('Using material.fileUrl, normalized to:', normalized);
      return normalized;
    }
    if (material.filePath) {
      const normalized = normalizeMaterialUrl(material.filePath);
      console.log('Using material.filePath, normalized to:', normalized);
      return normalized;
    }
    
    // Fallback: try to construct URL from fileName if it exists
    if (material.fileName) {
      console.warn('No URL fields found, attempting to construct from fileName:', material.fileName);
      const fallbackUrl = `http://localhost:3003/uploads/materials/${material.fileName}`;
      console.log('Fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
    
    console.error('getMaterialUrl: No URL field or fileName found in material object:', material);
    return null;
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setActiveView('subjects');
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const openMaterialInNewTab = (url) => {
    if (!url) {
      return false;
    }

    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      return true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  };

  const handleMaterialClick = (material) => {
    console.log('=== MATERIAL CLICK DEBUG ===');
    console.log('Material object:', material);
    console.log('Material fields:', {
      id: material?.id,
      title: material?.title,
      fileName: material?.fileName,
      filePath: material?.filePath,
      fileUrl: material?.fileUrl,
      url: material?.url,
      type: material?.type,
      fileType: material?.fileType
    });
    
    const url = getMaterialUrl(material);
    console.log('Resolved URL:', url);
    
    if (!url) {
      console.error('No URL could be resolved for material:', material);
      alert('Error: Could not load material. The instructor may not have published it yet.');
      return;
    }

    const fileName = material.fileName || material.title || 'file';
    console.log('File name:', fileName);
    console.log('Material type field:', material.type);
    
    const isPdf = material.type === 'pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'));
    const isVideo = material.type === 'video' || (fileName && /\.(mp4|webm|mov)$/i.test(fileName));
    const canPreviewInline = isPdf || isVideo;

    console.log('File type checks:', { isPdf, isVideo, canPreviewInline, fileName });

    if (!openMaterialInNewTab(url)) {
      console.error('Unable to open material in a new tab:', url);
      alert('Could not open the material automatically. Please try again or copy the link manually.');
    }
  };

  const handleVideoClick = (video) => {
    console.log('=== VIDEO CLICK DEBUG ===');
    if (!video) {
      console.error('No video object provided');
      alert('Error: Video not available');
      return;
    }
    
    console.log('Video object:', video);
    const url = getMaterialUrl(video);
    console.log('Resolved video URL:', url);
    
    if (!url) {
      console.error('No URL for video:', video);
      alert('Error: Video file path not available');
      return;
    }

    if (!openMaterialInNewTab(url)) {
      console.error('Unable to open video in a new tab:', url);
      alert('Could not open the video automatically. Please try again or copy the link manually.');
    }
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
    (s.title || s.name)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
                    <td className="name-cell">{subject.title || subject.name}</td>
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
            <h1 className="header-title">{selectedSubject?.title || selectedSubject?.name} Course Plan</h1>
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
                  <th style={{ width: '150px' }}>Duration</th>
                  <th style={{ width: '200px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {sortedUnits.map(unitNo => {
                  console.log('Rendering unit:', unitNo, 'Items:', groupedCoursePlan[unitNo]);
                  return groupedCoursePlan[unitNo].map((item, idx) => {
                    const topicRows = item.topics && item.topics.length > 0
                      ? item.topics
                      : [{ title: item.topic, duration: item.duration, materials: [] }];

                    console.log('Item:', item.id, 'Topic rows:', topicRows);
                    console.log('Item duration:', item.duration);
                    console.log('Item description:', item.description);

                    return topicRows.map((topic, topicIdx) => {
                      const topicMaterial = findTopicMaterial(topic) || (topicIdx === 0 ? item.lectureMaterial : null);
                      const topicVideo = findTopicVideo(topic) || (topicIdx === 0 ? item.lectureVideo : null);
                      const showUnitCell = topicIdx === 0;
                      const rowSpan = topicRows.length;

                      console.log(`Row ${topicIdx}: showUnitCell=${showUnitCell}, rowSpan=${rowSpan}, duration=${item.duration}, description=${item.description}`);

                      return (
                        <tr key={`${item.id}-${topicIdx}`}>
                          {showUnitCell && (
                            <td rowSpan={rowSpan} className="unit-cell">
                              Unit {unitNo}
                            </td>
                          )}
                          <td className="topic-cell">
                            <div className="topic-list-preview">
                              <div className="topic-list-item">
                                <span className="topic-index">{topicIdx + 1}.</span>
                                <span>{topic.title || topic.name || topic.subject || item.topic}</span>
                              </div>
                            </div>
                          </td>
                          <td className="material-cell">
                            {topicMaterial ? (
                              <button
                                className="material-link-btn"
                                onClick={() => handleMaterialClick(topicMaterial)}
                                title={topicMaterial.title || topicMaterial.fileName}
                              >
                                <HiOutlineDocument size={16} />
                                <span>{topicMaterial.title || topicMaterial.fileName || 'Lecture Material'}</span>
                                <HiOutlineExternalLink size={14} style={{ marginLeft: '4px', opacity: 0.7 }} />
                              </button>
                            ) : (
                              <span className="no-material">—</span>
                            )}
                          </td>
                          <td className="video-cell">
                            {topicVideo ? (
                              <button
                                className="material-link-btn video-link"
                                onClick={() => handleVideoClick(topicVideo)}
                                title={topicVideo.title || topicVideo.fileName}
                              >
                                <HiOutlinePlay size={16} />
                                <span>{topicVideo.title || topicVideo.fileName || 'Lecture Video'}</span>
                                <HiOutlineExternalLink size={14} style={{ marginLeft: '4px', opacity: 0.7 }} />
                              </button>
                            ) : (
                              <span className="no-material">—</span>
                            )}
                          </td>
                          {showUnitCell && (
                            <td rowSpan={rowSpan} className="hours-cell">
                              {item.duration || topic.duration || '-'}
                            </td>
                          )}
                          {showUnitCell && (
                            <td rowSpan={rowSpan} className="description-cell">
                              {item.description || topic.description || '-'}
                            </td>
                          )}
                        </tr>
                      );
                    });
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ==================== MATERIAL PREVIEW MODAL ====================
  if (selectedMaterial) {
    const materialUrl = getMaterialUrl(selectedMaterial);
    const fileName = selectedMaterial.fileName || selectedMaterial.title || 'Material Preview';
    const isPdfFile = selectedMaterial.type === 'pdf' || 
                      selectedMaterial.fileType?.toLowerCase().includes('pdf') ||
                      selectedMaterial.fileName?.endsWith('.pdf');
    const isVideoFile = selectedMaterial.type === 'video' || 
                        selectedMaterial.fileType?.toLowerCase().includes('video') ||
                        selectedMaterial.fileName?.match(/\.(mp4|webm|mov)$/i);
    
    console.log('Material modal rendering:', { 
      materialUrl, 
      fileName, 
      isPdfFile, 
      isVideoFile,
      fileType: selectedMaterial.fileType,
      type: selectedMaterial.type,
      fileName: selectedMaterial.fileName
    });
    
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="material-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{fileName}</h2>
            <button className="close-modal" onClick={handleCloseModal}>
              <HiOutlineX size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="material-preview">
              <div className="material-details">
                <p><strong>Type:</strong> {(selectedMaterial.type || selectedMaterial.fileType || selectedMaterial.fileName?.split('.').pop() || 'document').toUpperCase()}</p>
                <p><strong>Size:</strong> {selectedMaterial.size || selectedMaterial.fileSize || 'Unknown'}</p>
                <p><strong>Uploaded:</strong> {selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
              <div className="preview-area">
                {materialUrl && isPdfFile && (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {!pdfViewerFailed ? (
                      <>
                        {/* Try native iframe first */}
                        <iframe 
                          src={materialUrl}
                          title={fileName}
                          className="pdf-preview"
                          frameBorder="0"
                          style={{ width: '100%', height: '100%', minHeight: '600px', flex: 1 }}
                          onLoad={() => {
                            console.log('✓ PDF iframe loaded successfully:', materialUrl);
                          }}
                          onError={(e) => {
                            console.error('✗ PDF iframe load error, switching to Google Docs viewer:', { url: materialUrl, error: e });
                            setPdfViewerFailed(true);
                          }}
                          allow="autoplay"
                        />
                        <div style={{ marginTop: '10px', textAlign: 'center', padding: '10px' }}>
                          <small style={{ color: '#666' }}>
                            {' '}or{' '}
                            <a 
                              href={materialUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download={fileName}
                              style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              download PDF
                            </a>
                          </small>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Fallback to Google Docs viewer */}
                        <iframe 
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(materialUrl)}&embedded=true`}
                          title={fileName}
                          className="pdf-preview"
                          frameBorder="0"
                          style={{ width: '100%', height: '100%', minHeight: '600px', flex: 1 }}
                          onLoad={() => {
                            console.log('✓ Google Docs PDF viewer loaded successfully');
                          }}
                          onError={(e) => {
                            console.error('✗ Google Docs viewer also failed:', e);
                          }}
                        />
                        <div style={{ marginTop: '10px', textAlign: 'center', padding: '10px' }}>
                          <small style={{ color: '#666' }}>
                            {' '}or{' '}
                            <a 
                              href={materialUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download={fileName}
                              style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              download PDF
                            </a>
                          </small>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {materialUrl && isVideoFile && (
                  <video controls className="video-preview" onError={(e) => console.error('✗ Video failed to load', e)}>
                    <source src={materialUrl} type={getVideoMimeType(selectedMaterial.fileName || selectedMaterial.filePath || selectedMaterial.fileUrl || selectedMaterial.url)} />
                    Your browser does not support the video tag.
                  </video>
                )}
                {(!materialUrl || (!isPdfFile && !isVideoFile)) && (
                  <div className="document-preview">
                    <HiOutlineDocument size={64} />
                    <p>{materialUrl ? 'Preview not available for this file type' : 'File URL not found'}</p>
                    {materialUrl && (
                      <button className="download-large-btn" onClick={() => {
                        console.log('Downloading from:', materialUrl);
                        window.open(materialUrl, '_blank');
                      }}>
                        <HiOutlineDownload size={20} /> Download File
                      </button>
                    )}
                    {!materialUrl && (
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                        File not available. Contact your instructor.
                      </p>
                    )}
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
            {getMaterialUrl(selectedVideo) ? (
              <video controls autoPlay className="video-preview-full">
                <source src={getMaterialUrl(selectedVideo)} type={getVideoMimeType(selectedVideo.fileName || selectedVideo.filePath || selectedVideo.fileUrl || selectedVideo.url)} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="document-preview" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <HiOutlineVideoCamera size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
                <p style={{ marginBottom: '20px', color: '#64748b' }}>Video file location not found</p>
                <button className="download-large-btn" onClick={() => window.open(getMaterialUrl(selectedVideo) || '#', '_blank')} disabled>
                  Unable to load video
                </button>
              </div>
            )}
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
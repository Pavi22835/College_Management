import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiBookOpen,
  FiClock,
  FiCalendar,
  FiDownload,
  FiEye,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiUpload,
  FiFileText,
  FiVideo,
  FiImage,
  FiPaperclip,
  FiExternalLink,
  FiList
} from 'react-icons/fi';
import courseApi from '../../api/courseApi';
import staffApi from '../../api/staffApi';
import './StaffCourseDetail.css';

const StaffCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lesson/Unit management states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '30 mins',
    description: ''
  });
  
  // Subject/Topic management states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedUnitForSubject, setSelectedUnitForSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    title: '',
    description: '',
    duration: '30 mins'
  });
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourseById(courseId);
      const courseData = response?.data || response;

      if (!courseData) {
        throw new Error('Invalid course data');
      }

      if (courseData.lessons && Array.isArray(courseData.lessons)) {
        const normalizedLessons = courseData.lessons.map((lesson) => ({
          ...lesson,
          subjects: (lesson.topics || lesson.subjects || []).map((topic) => ({
            ...topic,
            materials: (topic.materials || []).map((m) => ({
              ...m,
              fileType: m.fileType || m.type,
              filePath: m.filePath || m.url,
              type: m.type || m.fileType
            }))
          })),
          materials: (lesson.materials || []).map((m) => ({
            ...m,
            fileType: m.fileType || m.type,
            filePath: m.filePath || m.url,
            type: m.type || m.fileType
          }))
        }));

        courseData.lessons = normalizedLessons;
      }

      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setErrorMessage('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };


  // Lesson/Unit CRUD operations
  const handleAddLesson = async () => {
    if (!lessonForm.title) {
      setErrorMessage('Please fill in lesson title');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const lessonData = {
        title: lessonForm.title,
        description: lessonForm.description,
        duration: lessonForm.duration,
        order: (course.lessons || []).length,
        subjects: []
      };

      const response = await courseApi.createLesson(course.id, lessonData);

      if (response?.success) {
        const newLesson = {
          ...response.data,
          subjects: []
        };
        
        setCourse({
          ...course,
          lessons: [...(course.lessons || []), newLesson]
        });
        
        setShowLessonModal(false);
        setLessonForm({ title: '', duration: '30 mins', description: '' });
        setEditingLesson(null);
        
        setSuccessMessage('Unit added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      setErrorMessage('Failed to add unit: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      duration: lesson.duration || '30 mins',
      description: lesson.description || ''
    });
    setShowLessonModal(true);
  };

  const handleUpdateLesson = async () => {
    if (!lessonForm.title) {
      setErrorMessage('Please fill in lesson title');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const lessonData = {
        title: lessonForm.title,
        description: lessonForm.description,
        duration: lessonForm.duration
      };

      const response = await courseApi.updateLesson(editingLesson.id, lessonData);

      if (response?.success) {
        const updatedLessons = course.lessons.map(l => 
          l.id === editingLesson.id ? { ...response.data, subjects: l.subjects || [] } : l
        );

        setCourse({
          ...course,
          lessons: updatedLessons
        });

        setShowLessonModal(false);
        setLessonForm({ title: '', duration: '30 mins', description: '' });
        setEditingLesson(null);
        
        setSuccessMessage('Unit updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      setErrorMessage('Failed to update unit');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this unit? All topics inside will also be deleted.')) return;

    try {
      const response = await courseApi.deleteLesson(lessonId);

      if (response?.success) {
        const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
        
        setCourse({
          ...course,
          lessons: updatedLessons
        });
        
        setSuccessMessage('Unit deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setErrorMessage('Failed to delete unit');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getMaterialUrl = (material) => {
    if (!material) return null;

    const urlValue = material.url || material.fileUrl || material.filePath;
    if (urlValue) {
      if (/^https?:\/\//i.test(urlValue)) {
        return urlValue;
      }

      const normalizedPath = urlValue.startsWith('/') ? urlValue : `/${urlValue}`;
      try {
        return new URL(`http://localhost:3003${normalizedPath}`).toString();
      } catch (err) {
        return `http://localhost:3003${normalizedPath}`;
      }
    }

    if (material.fileName) {
      return `http://localhost:3003/uploads/materials/${encodeURIComponent(material.fileName)}`;
    }

    return null;
  };

  // Subject/Topic CRUD operations
  const handleAddSubject = (unit) => {
    setSelectedUnitForSubject(unit);
    setEditingSubject(null);
    setSubjectForm({
      title: '',
      description: '',
      duration: '30 mins'
    });
    setShowSubjectModal(true);
  };

  const handleEditSubject = (unit, subject) => {
    setSelectedUnitForSubject(unit);
    setEditingSubject(subject);
    setSubjectForm({
      title: subject.title || '',
      description: subject.description || '',
      duration: subject.duration || '30 mins'
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.title) {
      setErrorMessage('Please enter a topic title');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      if (editingSubject) {
        const response = await courseApi.updateTopic(editingSubject.id, {
          title: subjectForm.title,
          description: subjectForm.description,
          duration: subjectForm.duration
        });
        
        if (response?.success) {
          const updatedSubjects = selectedUnitForSubject.subjects.map(sub => 
            sub.id === editingSubject.id 
              ? { ...sub, ...subjectForm }
              : sub
          );
          
          const updatedLessons = course.lessons.map(lesson => 
            lesson.id === selectedUnitForSubject.id
              ? { ...lesson, subjects: updatedSubjects }
              : lesson
          );
          
          setCourse({
            ...course,
            lessons: updatedLessons
          });
          
          setSuccessMessage('Topic updated successfully!');
        }
      } else {
        const response = await courseApi.createTopic(selectedUnitForSubject.id, {
          title: subjectForm.title,
          description: subjectForm.description,
          duration: subjectForm.duration
        });
        
        if (response?.success) {
          const newSubject = {
            ...response.data,
            materials: []
          };
          
          const updatedSubjects = [...(selectedUnitForSubject.subjects || []), newSubject];
          
          const updatedLessons = course.lessons.map(lesson => 
            lesson.id === selectedUnitForSubject.id
              ? { ...lesson, subjects: updatedSubjects }
              : lesson
          );
          
          setCourse({
            ...course,
            lessons: updatedLessons
          });
          
          setSuccessMessage('Topic added successfully!');
        }
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowSubjectModal(false);
      setSubjectForm({ title: '', description: '', duration: '30 mins' });
      setSelectedUnitForSubject(null);
      setEditingSubject(null);
      
    } catch (error) {
      console.error('Error saving topic:', error);
      setErrorMessage('Failed to save topic: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteSubject = async (unit, subjectId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      const response = await courseApi.deleteTopic(subjectId);
      
      if (response?.success) {
        const updatedSubjects = unit.subjects.filter(sub => sub.id !== subjectId);
        
        const updatedLessons = course.lessons.map(lesson => 
          lesson.id === unit.id
            ? { ...lesson, subjects: updatedSubjects }
            : lesson
        );
        
        setCourse({
          ...course,
          lessons: updatedLessons
        });
        
        setSuccessMessage('Topic deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      setErrorMessage('Failed to delete topic');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Material upload for topics
  const handleUploadTopicMaterial = async (topicId, file) => {
    if (!file) {
      setErrorMessage('Please select a file to upload');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const response = await courseApi.uploadMaterialToTopic(topicId, file);

      if (response?.success || response?.data) {
        await fetchCourseDetails();
        setSuccessMessage('Material uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading topic material:', error);
      setErrorMessage('Failed to upload material: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Material upload for lessons
  const handleUploadMaterial = async (lessonId, file) => {
    if (!file) {
      setErrorMessage('Please select a file to upload');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You are not logged in. Please refresh the page.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`http://localhost:3003/api/materials/lesson/${lessonId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorData}`);
      }

      const uploadedData = await uploadResponse.json();

      if (!uploadedData.success) {
        throw new Error(uploadedData.message || 'Upload failed');
      }

      const newMaterial = {
        id: uploadedData.data.id,
        title: uploadedData.data.title,
        type: uploadedData.data.type,
        url: `http://localhost:3003${uploadedData.data.url}`,
        size: uploadedData.data.size,
        uploadedAt: uploadedData.data.uploadedAt
      };

      const updatedLessons = course.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            materials: [...(lesson.materials || []), newMaterial]
          };
        }
        return lesson;
      });

      setCourse({
        ...course,
        lessons: updatedLessons
      });
      
      setSuccessMessage('Material uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading material:', error);
      setErrorMessage('Failed to upload material');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteMaterial = async (lessonId, materialId, topicId = null) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await courseApi.deleteMaterial(materialId);

      if (response?.success) {
        if (topicId) {
          // Remove from topic materials
          const updatedLessons = course.lessons.map(lesson => ({
            ...lesson,
            subjects: lesson.subjects.map(subject => 
              subject.id === topicId 
                ? { ...subject, materials: subject.materials.filter(m => m.id !== materialId) }
                : subject
            )
          }));
          setCourse({ ...course, lessons: updatedLessons });
        } else {
          // Remove from lesson materials
          const updatedLessons = course.lessons.map(lesson => 
            lesson.id === lessonId
              ? { ...lesson, materials: lesson.materials.filter(m => m.id !== materialId) }
              : lesson
          );
          setCourse({ ...course, lessons: updatedLessons });
        }
        
        setSuccessMessage('Material deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      setErrorMessage('Failed to delete material');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Student management

  const getMaterialIcon = (type) => {
    switch(type) {
      case 'video': return <FiVideo size={14} />;
      case 'pdf': return <FiFileText size={14} />;
      case 'word': return <FiFileText size={14} />;
      case 'image': return <FiImage size={14} />;
      default: return <FiFileText size={14} />;
    }
  };

  return (
    <>
      {successMessage && (
        <div className="success-message">
          <FiCheck size={16} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          <FiAlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="course-detail-loading">
          <div className="spinner"></div>
          <p>Loading course details...</p>
        </div>
      ) : course ? (
        <div className="staff-course-detail">
          {successMessage && (
            <div className="success-message">
              <FiCheck size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
          <FiAlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/staff/courses')}>
          <FiArrowLeft size={18} /> Back to Courses
        </button>
        <div className="course-title-section">
          <h1>{course.name}</h1>
          <span className="course-code-badge">{course.code}</span>
          {course.batch && <span className="batch-badge-detail">{course.batch}</span>}
        </div>
        <div className="course-meta-grid">
          <div className="meta-card">
            <FiBookOpen size={20} />
            <div>
              <span className="meta-label">Department</span>
              <span className="meta-value">{course.department}</span>
            </div>
          </div>
          <div className="meta-card">
            <FiCalendar size={20} />
            <div>
              <span className="meta-label">Semester</span>
              <span className="meta-value">Semester {course.semester}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-content">
        <section className="syllabus-section">
          <div className="curriculum-header">
            <div className="curriculum-title-wrapper">
              <div className="curriculum-icon">
                <FiBookOpen size={18} />
              </div>
              <div>
                <h3 className="curriculum-title">Course Curriculum</h3>
                <p className="curriculum-subtitle">{course.lessons?.length || 0} Units</p>
              </div>
            </div>
            <button className="add-unit-btn" onClick={() => { setEditingLesson(null); setLessonForm({ title: '', duration: '30 mins', description: '' }); setShowLessonModal(true); }}>
              <FiPlus size={16} />
              Add Unit
            </button>
          </div>

          <div className="units-list">
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => (
                <div className="unit-card" key={lesson.id}>
                  <div className="unit-card-header">
                    <div className="unit-card-title">
                      <span className="unit-badge">Unit {index + 1}</span>
                      <div>
                        <h4>{lesson.title}</h4>
                        {lesson.description && <p className="unit-desc-preview">{lesson.description}</p>}
                      </div>
                    </div>
                    <div className="unit-card-meta">
                      <span className="unit-pill"><FiClock size={12} /> {lesson.duration || '30 mins'}</span>
                      <span className="unit-pill"><FiList size={12} /> {lesson.subjects?.length || 0} Topics</span>
                    </div>
                    <div className="unit-card-actions">
                      <label className="icon-button upload" title="Upload Materials">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.mkv"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleUploadMaterial(lesson.id, e.target.files[0]);
                            }
                          }}
                        />
                        <FiUpload size={16} />
                      </label>
                      <button className="icon-button" onClick={() => handleEditLesson(lesson)} title="Edit Unit">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="icon-button danger" onClick={() => handleDeleteLesson(lesson.id)} title="Delete Unit">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="unit-card-body">
                    <div className="topics-block">
                      <div className="topics-block-header">
                        <div>
                          <h5>Topics Covered</h5>
                          <span>{lesson.subjects?.length || 0} topics outlined</span>
                        </div>
                        <button className="add-topic-button" onClick={() => handleAddSubject(lesson)}>
                          <FiPlus size={14} />
                          Add Topic
                        </button>
                      </div>

                      {lesson.subjects && lesson.subjects.length > 0 ? (
                        <div className="topic-list">
                          {lesson.subjects.map((subject, subIndex) => (
                            <div className="topic-item" key={subject.id}>
                              {/* Left Side - Topic Info */}
                              <div className="topic-info-side">
                                <div className="topic-header-left">
                                  <div className="topic-info-content">
                                    <div className="topic-number-badge">{subIndex + 1}</div>
                                    <div className="topic-info-text">
                                      <p className="topic-title">{subject.title}</p>
                                      {subject.duration && <span className="topic-duration-label"><FiClock size={12} /> {subject.duration}</span>}
                                    </div>
                                  </div>
                                  <div className="topic-actions-left">
                                    <label className="icon-button upload" title="Upload Materials">
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.mkv"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            handleUploadTopicMaterial(subject.id, e.target.files[0]);
                                          }
                                        }}
                                      />
                                      <FiUpload size={14} />
                                    </label>
                                    <button className="icon-button" onClick={() => handleEditSubject(lesson, subject)} title="Edit Topic">
                                      <FiEdit2 size={14} />
                                    </button>
                                    <button className="icon-button danger" onClick={() => handleDeleteSubject(lesson, subject.id)} title="Delete Topic">
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side - Materials */}
                              <div className="materials-right-side">
                                {subject.materials && subject.materials.length > 0 ? (
                                  <div className="materials-right-list">
                                    {subject.materials.map((material, idx) => (
                                      <div key={idx} className="material-right-item" title={material.title}>
                                        {getMaterialIcon(material.fileType)}
                                        <span className="material-right-name">{material.title}</span>
                                        <div className="material-right-actions">
                                          <a href={getMaterialUrl(material)} target="_blank" rel="noopener noreferrer" className="material-right-link" title="Open">
                                            <FiExternalLink size={12} />
                                          </a>
                                          <button className="material-right-delete" onClick={() => handleDeleteMaterial(null, material.id, subject.id)} title="Delete">
                                            <FiTrash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="materials-right-empty">
                                    —
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="topics-empty-sub">
                          <span>No topics added yet</span>
                          <button className="empty-add-topic-sub" onClick={() => handleAddSubject(lesson)}>
                            Add your first topic
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-units-card">
                <FiBookOpen size={48} />
                <h4>No units yet</h4>
                <p>Start by adding your first unit to build the syllabus.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Add/Edit Unit Modal */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLesson ? 'Edit Unit' : 'Add New Unit'}</h2>
              <button className="close-btn" onClick={() => setShowLessonModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Unit Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Introduction to Data Science" 
                  value={lessonForm.title} 
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g., 30 mins" 
                  value={lessonForm.duration} 
                  onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Enter unit description" 
                  value={lessonForm.description} 
                  onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={editingLesson ? handleUpdateLesson : handleAddLesson}>
                {editingLesson ? 'Update Unit' : 'Add Unit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Topic Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? 'Edit Topic' : 'Add New Topic'}</h2>
              <button className="close-btn" onClick={() => setShowSubjectModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Topic Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Classification of Data Science" 
                  value={subjectForm.title} 
                  onChange={(e) => setSubjectForm({...subjectForm, title: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g., 45 mins" 
                  value={subjectForm.duration} 
                  onChange={(e) => setSubjectForm({...subjectForm, duration: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  rows="3" 
                  placeholder="Enter topic description" 
                  value={subjectForm.description} 
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveSubject}>
                {editingSubject ? 'Update Topic' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  ) : (
    <div className="course-detail-not-found">
      <h2>Course Not Found</h2>
      <button onClick={() => navigate('/staff/courses')}>Back to Courses</button>
    </div>
  )}
    </>
  );
};

export default StaffCourseDetail;
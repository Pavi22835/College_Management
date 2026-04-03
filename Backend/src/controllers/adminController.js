import prisma from "../prisma/client.js";
import bcrypt from 'bcryptjs';

// ==================== STUDENT MANAGEMENT ====================

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get trashed students
export const getTrashedStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { 
        NOT: { deletedAt: null } 
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error in getTrashedStudents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error in getStudentById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const { 
      email, 
      name, 
      password, 
      rollNo, 
      age,
      gender,
      course, 
      semester, 
      batch, 
      phone, 
      address 
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check if roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo }
    });

    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student with this roll number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true
      }
    });

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo,
        email,
        name,
        age: age ? parseInt(age) : null,
        gender,
        course,
        semester: semester ? parseInt(semester) : null,
        batch,
        phone,
        address
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'STUDENT',
        entityId: student.id,
        details: `Created student: ${name} (${rollNo})`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry: A student with this email or roll number already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      age, 
      gender, 
      course, 
      semester, 
      batch, 
      phone, 
      address 
    } = req.body;

    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!existingStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Update student
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        name,
        age: age ? parseInt(age) : existingStudent.age,
        gender,
        course,
        semester: semester ? parseInt(semester) : existingStudent.semester,
        batch,
        phone,
        address,
        updatedAt: new Date()
      }
    });

    // Update user name if changed
    if (name && name !== existingStudent.user.name) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: { name }
      });
    }

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'STUDENT',
        entityId: student.id,
        details: `Updated student: ${student.name}`
      }
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Error in updateStudent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete student (soft delete)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Save to trash
    await prisma.trash.create({
      data: {
        entity: 'STUDENT',
        entityId: student.id,
        data: student,
        deletedBy: req.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Soft delete
    await prisma.student.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'STUDENT',
        entityId: student.id,
        details: `Deleted student: ${student.name} (${student.rollNo})`
      }
    });

    res.json({
      success: true,
      message: 'Student moved to trash successfully'
    });
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Restore student from trash
export const restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Restore student
    await prisma.student.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null }
    });

    // Restore user
    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: true }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'STUDENT',
        entityId: parseInt(id)
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'RESTORE',
        entity: 'STUDENT',
        entityId: parseInt(id),
        details: `Restored student: ${student.name} (${student.rollNo})`
      }
    });

    res.json({
      success: true,
      message: 'Student restored successfully'
    });
  } catch (error) {
    console.error('Error in restoreStudent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Permanently delete student
export const permanentDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Delete student
    await prisma.student.delete({
      where: { id: parseInt(id) }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: student.userId }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'STUDENT',
        entityId: parseInt(id)
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'PERMANENT_DELETE',
        entity: 'STUDENT',
        entityId: parseInt(id),
        details: `Permanently deleted student: ${student.name} (${student.rollNo})`
      }
    });

    res.json({
      success: true,
      message: 'Student permanently deleted'
    });
  } catch (error) {
    console.error('Error in permanentDeleteStudent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== TEACHER MANAGEMENT ====================

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await prisma.staff.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        courses: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error in getAllTeachers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get trashed teachers
export const getTrashedTeachers = async (req, res) => {
  try {
    const teachers = await prisma.staff.findMany({
      where: { 
        NOT: { deletedAt: null } 
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error in getTrashedTeachers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error in getTeacherById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new teacher
export const createTeacher = async (req, res) => {
  try {
    const { 
      email, 
      name, 
      password, 
      employeeId, 
      department, 
      designation,
      qualification,
      phone,
      joiningDate,
      gender
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check if employee ID exists
    const existingTeacher = await prisma.staff.findUnique({
      where: { employeeId }
    });

    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher with this employee ID already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STAFF',
        isActive: true
      }
    });

    // Create staff profile
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        employeeId,
        name,
        email,
        department,
        designation,
        qualification,
        phone,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        gender
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'STAFF',
        entityId: staff.id,
        details: `Created staff: ${name} (${employeeId})`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error in createTeacher:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry: Staff with this email or employee ID already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      department, 
      designation,
      qualification,
      phone,
      gender
    } = req.body;

    const existingTeacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!existingTeacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Update teacher
    const teacher = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
        name,
        department,
        designation,
        qualification,
        phone,
        gender,
        updatedAt: new Date()
      }
    });

    // Update user name if changed
    if (name && name !== existingTeacher.user.name) {
      await prisma.user.update({
        where: { id: existingTeacher.userId },
        data: { name }
      });
    }

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'TEACHER',
        entityId: teacher.id,
        details: `Updated teacher: ${teacher.name}`
      }
    });

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher
    });
  } catch (error) {
    console.error('Error in updateTeacher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete teacher (soft delete)
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Save to trash
    await prisma.trash.create({
      data: {
        entity: 'TEACHER',
        entityId: teacher.id,
        data: teacher,
        deletedBy: req.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Soft delete
    await prisma.staff.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'TEACHER',
        entityId: teacher.id,
        details: `Deleted teacher: ${teacher.name} (${teacher.employeeId})`
      }
    });

    res.json({
      success: true,
      message: 'Teacher moved to trash successfully'
    });
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Restore teacher from trash
export const restoreTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Restore teacher
    await prisma.staff.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null }
    });

    // Restore user
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: true }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'TEACHER',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'RESTORE',
        entity: 'TEACHER',
        entityId: parseInt(id),
        details: `Restored teacher: ${teacher.name} (${teacher.employeeId})`
      }
    });

    res.json({
      success: true,
      message: 'Teacher restored successfully'
    });
  } catch (error) {
    console.error('Error in restoreTeacher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Permanently delete teacher
export const permanentDeleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Delete teacher
    await prisma.staff.delete({
      where: { id: parseInt(id) }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: teacher.userId }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'TEACHER',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'PERMANENT_DELETE',
        entity: 'TEACHER',
        entityId: parseInt(id),
        details: `Permanently deleted teacher: ${teacher.name} (${teacher.employeeId})`
      }
    });

    res.json({
      success: true,
      message: 'Teacher permanently deleted'
    });
  } catch (error) {
    console.error('Error in permanentDeleteTeacher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== COURSE MANAGEMENT ====================

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        teacher: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        enrollments: {
          select: {
            id: true,
            studentId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      credits: course.credits,
      department: course.department,
      semester: course.semester,
      teacher: course.teacher?.user?.name || 'Not Assigned',
      teacherId: course.teacherId,
      studentsCount: course.enrollments.length,
      status: course.status,
      schedule: course.schedule,
      room: course.room,
      createdAt: course.createdAt
    }));

    res.json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get trashed courses
export const getTrashedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { 
        NOT: { deletedAt: null } 
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error in getTrashedCourses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const { 
      code, 
      name, 
      description, 
      credits, 
      department, 
      semester,
      schedule,
      room
    } = req.body;

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course with this code already exists' 
      });
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        credits: parseInt(credits),
        department,
        semester: parseInt(semester),
        schedule,
        room,
        status: 'ACTIVE'
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'COURSE',
        entityId: course.id,
        details: `Created course: ${name} (${code})`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Course with this code already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      credits, 
      department, 
      semester,
      schedule,
      room,
      status,
      teacherId
    } = req.body;

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        credits: credits ? parseInt(credits) : undefined,
        department,
        semester: semester ? parseInt(semester) : undefined,
        schedule,
        room,
        status,
        teacherId: teacherId ? parseInt(teacherId) : null,
        updatedAt: new Date()
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'COURSE',
        entityId: course.id,
        details: `Updated course: ${course.name}`
      }
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete course (soft delete)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Save to trash
    await prisma.trash.create({
      data: {
        entity: 'COURSE',
        entityId: course.id,
        data: course,
        deletedBy: req.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Soft delete
    await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'COURSE',
        entityId: course.id,
        details: `Moved course to trash: ${course.name}`
      }
    });

    res.json({
      success: true,
      message: 'Course moved to trash successfully'
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Restore course from trash
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Restore course
    await prisma.course.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'COURSE',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'RESTORE',
        entity: 'COURSE',
        entityId: parseInt(id),
        details: `Restored course: ${course.name} (${course.code})`
      }
    });

    res.json({
      success: true,
      message: 'Course restored successfully'
    });
  } catch (error) {
    console.error('Error in restoreCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Permanently delete course
export const permanentDeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Delete course
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'COURSE',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'PERMANENT_DELETE',
        entity: 'COURSE',
        entityId: parseInt(id),
        details: `Permanently deleted course: ${course.name} (${course.code})`
      }
    });

    res.json({
      success: true,
      message: 'Course permanently deleted'
    });
  } catch (error) {
    console.error('Error in permanentDeleteCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== DASHBOARD STATS ====================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeCourses,
      totalAdmins
    ] = await Promise.all([
      prisma.student.count({ where: { deletedAt: null } }),
      prisma.staff.count({ where: { deletedAt: null } }),
      prisma.course.count({ where: { deletedAt: null } }),
      prisma.course.count({ 
        where: { 
          deletedAt: null, 
          status: 'ACTIVE' 
        } 
      }),
      prisma.admin.count({ where: { deletedAt: null } })
    ]);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get recent activities
    const recentActivities = await prisma.log.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Get total users
    const totalUsers = await prisma.user.count();

    res.json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          teachers: totalTeachers,
          courses: totalCourses,
          activeCourses,
          admins: totalAdmins,
          users: totalUsers,
          todayAttendance
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          description: activity.details || `${activity.action} ${activity.entity}`,
          user: activity.user,
          createdAt: activity.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== TRASH MANAGEMENT ====================

export const getTrash = async (req, res) => {
  try {
    const trash = await prisma.trash.findMany({
      orderBy: { deletedAt: 'desc' }
    });

    const formattedTrash = trash.map(item => ({
      ...item,
      data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data
    }));

    res.json({
      success: true,
      data: formattedTrash
    });
  } catch (error) {
    console.error('Error in getTrash:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const restoreFromTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const trashItem = await prisma.trash.findUnique({
      where: { id: parseInt(id) }
    });

    if (!trashItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trash item not found' 
      });
    }

    const data = typeof trashItem.data === 'string' 
      ? JSON.parse(trashItem.data) 
      : trashItem.data;

    switch (trashItem.entity) {
      case 'STUDENT':
        await prisma.student.update({
          where: { id: trashItem.entityId },
          data: { deletedAt: null }
        });
        await prisma.user.update({
          where: { id: data.userId },
          data: { isActive: true }
        });
        break;
      case 'COURSE':
        await prisma.course.update({
          where: { id: trashItem.entityId },
          data: { deletedAt: null }
        });
        break;
      case 'TEACHER':
        await prisma.staff.update({
          where: { id: trashItem.entityId },
          data: { deletedAt: null }
        });
        await prisma.user.update({
          where: { id: data.userId },
          data: { isActive: true }
        });
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Unknown entity type' 
        });
    }

    await prisma.trash.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Item restored successfully'
    });
  } catch (error) {
    console.error('Error in restoreFromTrash:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const trashItem = await prisma.trash.findUnique({
      where: { id: parseInt(id) }
    });

    if (!trashItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trash item not found' 
      });
    }

    // Delete trash entry
    await prisma.trash.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Item permanently deleted'
    });
  } catch (error) {
    console.error('Error in permanentDelete:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const emptyTrash = async (req, res) => {
  try {
    const { force } = req.query;

    let whereClause = {};
    
    if (force !== 'true') {
      whereClause = {
        expiresAt: {
          lt: new Date()
        }
      };
    }

    const result = await prisma.trash.deleteMany(whereClause);

    res.json({
      success: true,
      message: force === 'true' ? 'Trash emptied completely' : 'Expired items deleted',
      count: result.count
    });
  } catch (error) {
    console.error('Error in emptyTrash:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== ADMIN PROFILE ====================

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== USER MANAGEMENT ====================

/* -----------------------------------------
GET ALL USERS
------------------------------------------*/
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 50 } = req.query;

    let whereClause = {};
    
    if (role) {
      whereClause.role = role.toUpperCase();
    }
    
    if (status) {
      whereClause.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
ACTIVATE USER
------------------------------------------*/
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already active' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        isActive: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'ACTIVATE',
        entity: 'USER',
        entityId: parseInt(id),
        details: `Activated user: ${updatedUser.email} (${updatedUser.role})`
      }
    }).catch(err => console.warn('Log creation failed:', err));

    res.json({
      success: true,
      message: 'User activated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in activateUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
DEACTIVATE USER
------------------------------------------*/
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already inactive' 
      });
    }

    // Prevent deactivating own account
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        isActive: false,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'DEACTIVATE',
        entity: 'USER',
        entityId: parseInt(id),
        details: `Deactivated user: ${updatedUser.email} (${updatedUser.role})`
      }
    }).catch(err => console.warn('Log creation failed:', err));

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in deactivateUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
RESET USER PASSWORD
------------------------------------------*/
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent resetting own password via this endpoint
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Use your profile to change your own password' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'RESET_PASSWORD',
        entity: 'USER',
        entityId: parseInt(id),
        details: `Reset password for user: ${updatedUser.email}`
      }
    }).catch(err => console.warn('Log creation failed:', err));

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in resetUserPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
GET USER STATISTICS
------------------------------------------*/
export const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      studentCount,
      teacherCount,
      adminCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: {
          students: studentCount,
          teachers: teacherCount,
          admins: adminCount
        }
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== DEPARTMENT MANAGEMENT ====================

/* -----------------------------------------
GET ALL DEPARTMENTS - FIXED VERSION
------------------------------------------*/
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        hod: {
          select: {
            id: true,
            email: true,
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get course counts for each department separately
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const courseCount = await prisma.course.count({
          where: {
            department: dept.code,
            deletedAt: null
          }
        });

        const teacherCount = await prisma.staff.count({
          where: {
            department: dept.name,
            deletedAt: null
          }
        });

        return {
          ...dept,
          stats: {
            courses: courseCount,
            teachers: teacherCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: departmentsWithCounts
    });
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get trashed departments
export const getTrashedDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { 
        NOT: { deletedAt: null } 
      },
      include: {
        hod: {
          select: {
            id: true,
            email: true,
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error in getTrashedDepartments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
GET DEPARTMENT BY ID - FIXED VERSION
------------------------------------------*/
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        hod: {
          select: {
            id: true,
            email: true,
            name: true,
            employeeId: true,
            designation: true,
            phone: true
          }
        }
      }
    });

    if (!department || department.deletedAt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Get courses in this department
    const courses = await prisma.course.findMany({
      where: {
        department: department.code,
        deletedAt: null
      },
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        semester: true
      }
    });

    // Get teachers in this department
    const teachers = await prisma.staff.findMany({
      where: {
        department: department.name,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true
      }
    });

    res.json({
      success: true,
      data: {
        ...department,
        courses,
        teachers,
        stats: {
          totalCourses: courses.length,
          totalTeachers: teachers.length
        }
      }
    });
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
CREATE DEPARTMENT - FIXED VERSION (BUDGET REMOVED)
------------------------------------------*/
export const createDepartment = async (req, res) => {
  try {
    const { code, name, description, hodId, phone, email, location } = req.body;

    if (!code || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code and name are required' 
      });
    }

    // Check if HOD exists if provided
    if (hodId) {
      const hodExists = await prisma.staff.findUnique({
        where: { id: parseInt(hodId) }
      });

      if (!hodExists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Teacher not found' 
        });
      }

      // Check if teacher is already HOD of another department
      const existingHod = await prisma.department.findFirst({
        where: {
          hodId: parseInt(hodId),
          deletedAt: null
        }
      });

      if (existingHod) {
        return res.status(400).json({ 
          success: false, 
          message: 'This teacher is already HOD of another department' 
        });
      }
    }

    try {
      const department = await prisma.department.create({
        data: {
          code: code.toUpperCase(),
          name,
          description,
          // budget field removed - not in schema
          hodId: hodId ? parseInt(hodId) : null,
          phone,
          email,
          location
        },
        include: {
          hod: {
            select: {
              id: true,
              email: true,
              name: true,
              employeeId: true
            }
          }
        }
      });

      // Log the activity
      await prisma.log.create({
        data: {
          userId: req.user.id,
          action: 'CREATE',
          entity: 'DEPARTMENT',
          entityId: department.id,
          details: `Created department: ${department.code} - ${department.name}`
        }
      }).catch(err => console.warn('Log creation failed:', err));

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department
      });
    } catch (err) {
      if (err.code === 'P2002') {
        const field = err.meta.target[0];
        return res.status(400).json({ 
          success: false, 
          message: `${field} already exists` 
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error in createDepartment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
UPDATE DEPARTMENT - FIXED VERSION (BUDGET REMOVED)
------------------------------------------*/
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, hodId, phone, email, location } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department || department.deletedAt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Check if HOD exists if provided
    if (hodId) {
      const hodExists = await prisma.staff.findUnique({
        where: { id: parseInt(hodId) }
      });

      if (!hodExists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Teacher not found' 
        });
      }

      // Check if teacher is already HOD of another department (excluding current)
      if (hodId !== department.hodId) {
        const existingHod = await prisma.department.findFirst({
          where: {
            hodId: parseInt(hodId),
            id: { not: parseInt(id) },
            deletedAt: null
          }
        });

        if (existingHod) {
          return res.status(400).json({ 
            success: false, 
            message: 'This teacher is already HOD of another department' 
          });
        }
      }
    }

    try {
      const updatedDepartment = await prisma.department.update({
        where: { id: parseInt(id) },
        data: {
          code: code ? code.toUpperCase() : undefined,
          name,
          description,
          // budget field removed - not in schema
          hodId: hodId !== undefined ? (hodId ? parseInt(hodId) : null) : undefined,
          phone,
          email,
          location,
          updatedAt: new Date()
        },
        include: {
          hod: {
            select: {
              id: true,
              email: true,
              name: true,
              employeeId: true
            }
          }
        }
      });

      // Log the activity
      await prisma.log.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE',
          entity: 'DEPARTMENT',
          entityId: parseInt(id),
          details: `Updated department: ${updatedDepartment.code} - ${updatedDepartment.name}`
        }
      }).catch(err => console.warn('Log creation failed:', err));

      res.json({
        success: true,
        message: 'Department updated successfully',
        data: updatedDepartment
      });
    } catch (err) {
      if (err.code === 'P2002') {
        const field = err.meta.target[0];
        return res.status(400).json({ 
          success: false, 
          message: `${field} already exists` 
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/* -----------------------------------------
DELETE DEPARTMENT
------------------------------------------*/
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department || department.deletedAt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Check if department has courses
    const courseCount = await prisma.course.count({
      where: {
        department: department.code,
        deletedAt: null
      }
    });

    if (courseCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete department with ${courseCount} active courses` 
      });
    }

    // Soft delete
    const deletedDepartment = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { 
        deletedAt: new Date(),
        hodId: null
      }
    });

    // Create trash entry
    await prisma.trash.create({
      data: {
        entity: 'DEPARTMENT',
        entityId: parseInt(id),
        data: deletedDepartment,
        deletedBy: req.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }).catch(err => console.warn('Trash creation failed:', err));

    // Log the activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'DEPARTMENT',
        entityId: parseInt(id),
        details: `Deleted department: ${deletedDepartment.code} - ${deletedDepartment.name}`
      }
    }).catch(err => console.warn('Log creation failed:', err));

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Restore department from trash
export const restoreDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Restore department
    await prisma.department.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'DEPARTMENT',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'RESTORE',
        entity: 'DEPARTMENT',
        entityId: parseInt(id),
        details: `Restored department: ${department.code} - ${department.name}`
      }
    });

    res.json({
      success: true,
      message: 'Department restored successfully'
    });
  } catch (error) {
    console.error('Error in restoreDepartment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Permanently delete department
export const permanentDeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }

    // Delete department
    await prisma.department.delete({
      where: { id: parseInt(id) }
    });

    // Remove from trash
    await prisma.trash.deleteMany({
      where: {
        entity: 'DEPARTMENT',
        entityId: parseInt(id)
      }
    });

    // Log activity
    await prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'PERMANENT_DELETE',
        entity: 'DEPARTMENT',
        entityId: parseInt(id),
        details: `Permanently deleted department: ${department.code} - ${department.name}`
      }
    });

    res.json({
      success: true,
      message: 'Department permanently deleted'
    });
  } catch (error) {
    console.error('Error in permanentDeleteDepartment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'College Portal ERP API',
      version: '1.0.0',
      description: 'Complete API documentation for College Portal ERP System',
      contact: {
        name: 'API Support',
        email: 'support@collegeportal.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server',
      },
      {
        url: 'https://api.collegeportal.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Login', description: 'Login and authentication endpoints' },
      { name: 'Admin', description: 'Admin actions and operations' },
      { name: 'Staff', description: 'Staff endpoints' },
      { name: 'Staff - Dashboard', description: 'Staff dashboard endpoints' },
      { name: 'Staff - My Courses', description: 'Staff courses endpoints' },
      { name: 'Staff - My Students', description: 'Staff students endpoints' },
      { name: 'Staff - Attendance', description: 'Staff attendance endpoints' },
      { name: 'Staff - Schedule', description: 'Staff schedule endpoints' },
      { name: 'Staff - Reports', description: 'Staff reports endpoints' },
      { name: 'Student', description: 'Student endpoints' },
      { name: 'Attendance', description: 'Attendance endpoints' },
      { name: 'Courses', description: 'Course endpoints' },
      { name: 'Dashboard', description: 'Dashboard endpoints' },
      { name: 'Lessons', description: 'Lesson endpoints' },
      { name: 'Materials', description: 'Material endpoints' },
      { name: 'Topics', description: 'Topic endpoints' },
      { name: 'Schedule', description: 'Schedule endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['ADMIN', 'STAFF', 'STUDENT'], example: 'STUDENT' },
            isActive: { type: 'boolean', example: true },
            status: { type: 'string', enum: ['active', 'inactive', 'deactivated'], example: 'active' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'student@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            address: { type: 'string', example: '123 Main St, City, State' },
            dateOfBirth: { type: 'string', format: 'date', example: '2000-01-01' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            enrollmentNumber: { type: 'string', example: 'EN2024001' },
            batchId: { type: 'integer', example: 1 },
            department: { type: 'string', example: 'Computer Science' },
            semester: { type: 'integer', example: 1 },
            cgpa: { type: 'number', format: 'float', example: 8.5 },
            totalCredits: { type: 'integer', example: 120 },
            status: { type: 'string', enum: ['active', 'inactive', 'graduated', 'suspended'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Dr. Jane Smith' },
            email: { type: 'string', format: 'email', example: 'staff@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            department: { type: 'string', example: 'Computer Science' },
            designation: { type: 'string', example: 'Professor' },
            employeeId: { type: 'string', example: 'EMP001' },
            staffRole: { type: 'string', enum: ['HOD', 'FACULTY', 'MENTOR'], example: 'FACULTY' },
            qualification: { type: 'string', example: 'PhD in Computer Science' },
            joiningDate: { type: 'string', format: 'date', example: '2020-01-01' },
            address: { type: 'string', example: '456 College St, City, State' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            code: { type: 'string', example: 'CS101' },
            name: { type: 'string', example: 'Introduction to Programming' },
            description: { type: 'string', example: 'Basic programming concepts and fundamentals' },
            department: { type: 'string', example: 'Computer Science' },
            semester: { type: 'integer', example: 1 },
            credits: { type: 'integer', example: 3 },
            totalHours: { type: 'integer', example: 45 },
            maxStudents: { type: 'integer', example: 60 },
            studentsCount: { type: 'integer', example: 45 },
            status: { type: 'string', enum: ['active', 'inactive', 'completed'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            courseId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Variables and Data Types' },
            description: { type: 'string', example: 'Understanding variables and different data types in programming' },
            content: { type: 'string', example: 'Detailed lesson content...' },
            order: { type: 'integer', example: 1 },
            duration: { type: 'integer', example: 60 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Topic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            lessonId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Primitive Data Types' },
            description: { type: 'string', example: 'Learn about int, float, char, boolean data types' },
            content: { type: 'string', example: 'Detailed topic content...' },
            order: { type: 'integer', example: 1 },
            duration: { type: 'integer', example: 15 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 1 },
            courseId: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            status: { type: 'string', enum: ['present', 'absent', 'late'], example: 'present' },
            markedBy: { type: 'integer', example: 1 },
            notes: { type: 'string', example: 'Arrived 10 minutes late' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Material: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Programming Fundamentals PDF' },
            description: { type: 'string', example: 'Complete guide to programming basics' },
            fileName: { type: 'string', example: 'programming_fundamentals.pdf' },
            filePath: { type: 'string', example: '/uploads/materials/programming_fundamentals.pdf' },
            fileSize: { type: 'integer', example: 2048576 },
            mimeType: { type: 'string', example: 'application/pdf' },
            uploadedBy: { type: 'integer', example: 1 },
            courseId: { type: 'integer', example: 1 },
            lessonId: { type: 'integer', example: 1 },
            topicId: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            downloadCount: { type: 'integer', example: 25 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            error: { type: 'string', example: 'Detailed error message' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './index.js']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
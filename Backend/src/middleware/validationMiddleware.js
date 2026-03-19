/**
 * Validation middleware for authentication and resource management
 */

/**
 * Validate user registration
 */
const validateRegistration = (req, res, next) => {
  const { email, password, name, role } = req.body;

  // Check required fields
  if (!email || !password || !name || !role) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required',
      required: ['email', 'password', 'name', 'role']
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }

  // Password validation (min 6 chars)
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 6 characters' 
    });
  }

  // Password strength validation (optional)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  // Name validation
  if (name.length < 2) {
    return res.status(400).json({ 
      success: false,
      message: 'Name must be at least 2 characters' 
    });
  }

  // Role validation
  const validRoles = ['ADMIN', 'STAFF', 'STUDENT'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid role. Must be one of: ADMIN, STAFF, STUDENT' 
    });
  }

  next();
};

/**
 * Validate login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required' 
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }

  next();
};

/**
 * Validate student creation/update
 */
const validateStudent = (req, res, next) => {
  const { 
    email, name, rollNo, course, semester, 
    age, gender, batch, phone, address 
  } = req.body;

  // Required fields
  if (!email || !name || !rollNo || !course || !semester) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields',
      required: ['email', 'name', 'rollNo', 'course', 'semester']
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }

  // Semester validation
  const semesterNum = parseInt(semester);
  if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
    return res.status(400).json({ 
      success: false,
      message: 'Semester must be between 1 and 8' 
    });
  }

  // Age validation (if provided)
  if (age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Age must be between 15 and 100' 
      });
    }
  }

  // Gender validation (if provided)
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    return res.status(400).json({ 
      success: false,
      message: 'Gender must be Male, Female, or Other' 
    });
  }

  // Phone validation (if provided)
  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number must be 10 digits' 
      });
    }
  }

  next();
};

/**
 * Validate course creation/update
 */
const validateCourse = (req, res, next) => {
  const { 
    code, name, credits, department, 
    semester, description, schedule, room 
  } = req.body;

  // Required fields
  if (!code || !name || !credits || !department) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields',
      required: ['code', 'name', 'credits', 'department']
    });
  }

  // Course code format (e.g., CS401)
  const codeRegex = /^[A-Z]{2,4}[0-9]{3}$/;
  if (!codeRegex.test(code)) {
    return res.status(400).json({ 
      success: false,
      message: 'Course code must be 2-4 letters followed by 3 digits (e.g., CS401)' 
    });
  }

  // Credits validation
  const creditsNum = parseInt(credits);
  if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Credits must be between 1 and 6' 
    });
  }

  // Semester validation (if provided)
  if (semester) {
    const semesterNum = parseInt(semester);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return res.status(400).json({ 
        success: false,
        message: 'Semester must be between 1 and 8' 
      });
    }
  }

  // Description length (if provided)
  if (description && description.length > 500) {
    return res.status(400).json({ 
      success: false,
      message: 'Description must not exceed 500 characters' 
    });
  }

  next();
};

/**
 * Validate teacher creation/update
 */
const validateTeacher = (req, res, next) => {
  const { 
    email, name, employeeId, department, 
    designation, qualification, phone 
  } = req.body;

  // Required fields
  if (!email || !name || !employeeId || !department || !designation) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields',
      required: ['email', 'name', 'employeeId', 'department', 'designation']
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }

  // Employee ID format
  const empIdRegex = /^[A-Z]{3}[0-9]{3}$/;
  if (!empIdRegex.test(employeeId)) {
    return res.status(400).json({ 
      success: false,
      message: 'Employee ID must be 3 letters followed by 3 digits (e.g., TCH001)' 
    });
  }

  // Phone validation (if provided)
  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number must be 10 digits' 
      });
    }
  }

  next();
};

/**
 * Validate ID parameter
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      success: false,
      message: 'ID parameter is required' 
    });
  }

  const idNum = parseInt(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid ID format' 
    });
  }

  req.params.id = idNum; // Convert to number
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;

  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : 10;

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ 
      success: false,
      message: 'Page must be a positive number' 
    });
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ 
      success: false,
      message: 'Limit must be between 1 and 100' 
    });
  }

  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateStudent,
  validateCourse,
  validateTeacher,
  validateId,
  validatePagination
};
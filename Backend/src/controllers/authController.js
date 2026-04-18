import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

/* ========================================
   REGISTER USER
   POST /api/auth/register
======================================== */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      rollNo,
      course,
      semester,
      department,
      designation
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }

    const userRole = role ? role.toUpperCase() : "STUDENT";

    // Validate role-specific required fields
    if (userRole === "STUDENT" && !rollNo) {
      return res.status(400).json({
        success: false,
        error: "Roll number is required for students"
      });
    }

    if (userRole === "STAFF") {
      if (!department) {
        return res.status(400).json({
          success: false,
          error: "Department is required for staff"
        });
      }
      if (!designation) {
        return res.status(400).json({
          success: false,
          error: "Designation is required for staff"
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isActive: true,
        status: "active"
      }
    });

    let profile = null;

    /* Create student profile */
    if (userRole === "STUDENT") {
      profile = await prisma.student.create({
        data: {
          userId: user.id,
          name: name,
          email: email,
          rollNo: rollNo || `STU${Date.now()}`,
          course: course || null,
          semester: semester ? parseInt(semester) : 1,
          phone: phone || null
        }
      });
    }

    /* Create staff profile */
    if (userRole === "STAFF") {
      profile = await prisma.staff.create({
        data: {
          userId: user.id,
          name: name,
          email: email,
          employeeId: `EMP${Date.now()}`,
          department: department || "General",
          designation: designation || "Staff",
          appointedDate: new Date(),
          phone: phone || null,
          staffRole: "FACULTY"
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        status: user.status,
        profile: profile || null
      }
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        error: `A user with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error during registration"
    });
  }
};

/* ========================================
   LOGIN USER
   POST /api/auth/login
======================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        staff: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // CHECK IF ACCOUNT IS DEACTIVATED
    const isDeactivated = !user.isActive || user.status === 'deactivated' || user.status === 'inactive';
    
    if (isDeactivated) {
      console.log(`⚠️ Deactivated login attempt: ${email}`);
      return res.status(403).json({
        success: false,
        error: "Account is Deactivated",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Prepare user data based on role
    let userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.status
    };

    // Add role-specific data
    if (user.role === "STUDENT" && user.student) {
      userData = { 
        ...userData, 
        rollNo: user.student.rollNo,
        course: user.student.course,
        semester: user.student.semester,
        batch: user.student.batch,
        phone: user.student.phone
      };
    }

    if (user.role === "STAFF" && user.staff) {
      userData = { 
        ...userData, 
        employeeId: user.staff.employeeId,
        department: user.staff.department,
        designation: user.staff.designation,
        phone: user.staff.phone
      };
    }

    if (user.role === "ADMIN" && user.admin) {
      userData = { 
        ...userData, 
        employeeId: user.admin.employeeId,
        department: user.admin.department,
        phone: user.admin.phone
      };
    }

    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during login"
    });
  }
};

/* ========================================
   GET CURRENT USER
   GET /api/auth/me
======================================== */
export const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        staff: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Prepare user data based on role
    let userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific data
    if (user.role === "STUDENT" && user.student) {
      userData = { 
        ...userData, 
        rollNo: user.student.rollNo,
        course: user.student.course,
        semester: user.student.semester,
        batch: user.student.batch,
        phone: user.student.phone,
        address: user.student.address,
        dateOfBirth: user.student.dateOfBirth,
        gender: user.student.gender
      };
    }

    if (user.role === "STAFF" && user.staff) {
      userData = { 
        ...userData, 
        employeeId: user.staff.employeeId,
        department: user.staff.department,
        designation: user.staff.designation,
        phone: user.staff.phone,
        qualification: user.staff.qualification,
        joiningDate: user.staff.joiningDate,
        address: user.staff.address,
        dateOfBirth: user.staff.dateOfBirth,
        age: user.staff.age,
        gender: user.staff.gender
      };
    }

    if (user.role === "ADMIN" && user.admin) {
      userData = { 
        ...userData, 
        employeeId: user.admin.employeeId,
        department: user.admin.department,
        phone: user.admin.phone,
        address: user.admin.address
      };
    }

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error("❌ GetMe error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching user data"
    });
  }
};
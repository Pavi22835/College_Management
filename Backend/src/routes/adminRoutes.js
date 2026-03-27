import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import * as staffController from '../controllers/staffController.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('ADMIN'));

// ==================== USER MANAGEMENT ====================
router.get('/users/stats', adminController.getUserStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// ==================== STUDENT ROUTES ====================
router.get('/students', adminController.getAllStudents);
router.get('/students/trash', adminController.getTrashedStudents);
router.post('/students', adminController.createStudent);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/students/:id/restore', adminController.restoreStudent);
router.delete('/students/:id/permanent', adminController.permanentDeleteStudent);

// ==================== STAFF ROUTES - USING STAFF CONTROLLER ====================
// Role-specific routes
router.get('/staff/hods', staffController.getHODs);
router.get('/staff/faculty', staffController.getFaculty);
router.get('/staff/mentors', staffController.getMentors);
router.get('/staff/stats', staffController.getStaffStats);

// CRUD operations
router.get('/staff', staffController.getAllStaff);
router.post('/staff', staffController.createStaff);
router.get('/staff/:id', staffController.getStaffById);
router.put('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// Staff trash routes (using adminController for trash operations)
router.get('/staff/trash', adminController.getTrashedTeachers);
router.post('/staff/:id/restore', adminController.restoreTeacher);
router.delete('/staff/:id/permanent', adminController.permanentDeleteTeacher);

// ==================== COURSE ROUTES ====================
router.get('/courses', adminController.getAllCourses);
router.get('/courses/trash', adminController.getTrashedCourses);
router.post('/courses', adminController.createCourse);
router.get('/courses/:id', adminController.getCourseById);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.post('/courses/:id/restore', adminController.restoreCourse);
router.delete('/courses/:id/permanent', adminController.permanentDeleteCourse);

// ==================== DEPARTMENT ROUTES ====================
router.get('/departments', adminController.getAllDepartments);
router.get('/departments/trash', adminController.getTrashedDepartments);
router.post('/departments', adminController.createDepartment);
router.get('/departments/:id', adminController.getDepartmentById);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);
router.post('/departments/:id/restore', adminController.restoreDepartment);
router.delete('/departments/:id/permanent', adminController.permanentDeleteDepartment);

// ==================== DASHBOARD & UTILITIES ====================
router.get('/dashboard', adminController.getDashboardStats);
router.get('/profile', adminController.getAdminProfile);

// ==================== TRASH MANAGEMENT ====================
router.get('/trash', adminController.getTrash);
router.post('/trash/:id/restore', adminController.restoreFromTrash);
router.delete('/trash/:id/permanent', adminController.permanentDelete);
router.delete('/trash/empty', adminController.emptyTrash);

export default router;
# Student Dashboard - Course Enrollment Guide

## Problem
Student dashboard shows "No courses enrolled" because the student account doesn't have any enrollments.

## Solution: Create and Enroll Courses

You need to:
1. **Create courses** (as Admin) - via backend
2. **Enroll student in courses** (as Admin) - via backend

---

## Step 1: Create a Course (Using Admin Panel or API)

### Option A: Using Postman/API (Recommended for Testing)

```
POST http://localhost:5000/api/courses
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "code": "CS101",
  "name": "Introduction to Programming",
  "description": "Learn programming basics",
  "credits": 3,
  "department": "Computer Science",
  "semester": 1,
  "schedule": "MWF 9:00-10:00 AM",
  "room": "Lab-101",
  "teacherId": 1
}
```

**Note:** Replace `teacherId` with actual teacher ID from database.

### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CS101",
    "name": "Introduction to Programming",
    ...
  }
}
```

---

## Step 2: Enroll Student in Course

### Using API

```
POST http://localhost:5000/api/courses/enroll
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "studentId": 1,
  "courseId": 1
}
```

**Note:** Replace `studentId` and `courseId` with actual IDs.

### Response:
```json
{
  "success": true,
  "message": "Student enrolled successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "courseId": 1,
    "status": "ACTIVE"
  }
}
```

---

## How to Find Student and Teacher IDs

### Get Student ID
```sql
SELECT id, rollNo, email FROM "Student" WHERE email = 'student@example.com';
```

Or use API:
```
GET http://localhost:5000/api/admin/students
Authorization: Bearer <ADMIN_TOKEN>
```

### Get Teacher ID
```sql
SELECT id, name, email FROM "Teacher" WHERE email = 'teacher@example.com';
```

Or use API:
```
GET http://localhost:5000/api/admin/teachers
Authorization: Bearer <ADMIN_TOKEN>
```

---

## Quick Test Script (Node.js)

Create a file `test-enrollment.js` in Backend folder:

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'your_admin_token_here';

const headers = {
  Authorization: `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testEnrollment() {
  try {
    // 1. Create a course
    console.log('📚 Creating course...');
    const courseRes = await axios.post(`${API_BASE}/courses`, {
      code: 'CS101',
      name: 'Introduction to Programming',
      description: 'Learn programming basics',
      credits: 3,
      department: 'Computer Science',
      semester: 1,
      schedule: 'MWF 9:00-10:00 AM',
      room: 'Lab-101',
      teacherId: 1
    }, { headers });

    const courseId = courseRes.data.data.id;
    console.log('✅ Course created:', courseId);

    // 2. Enroll student
    console.log('👤 Enrolling student...');
    const enrollRes = await axios.post(`${API_BASE}/courses/enroll`, {
      studentId: 1,
      courseId: courseId
    }, { headers });

    console.log('✅ Student enrolled!');
    console.log('Response:', enrollRes.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEnrollment();
```

**To run:**
```bash
node test-enrollment.js
```

---

## Database Direct Approach (SQL)

If you prefer to insert data directly into PostgreSQL:

```sql
-- 1. Create a course
INSERT INTO "Course" (code, name, description, credits, department, semester, schedule, room, "teacherId", status, "createdAt", "updatedAt")
VALUES (
  'CS101',
  'Introduction to Programming',
  'Learn programming',
  3,
  'Computer Science',
  1,
  'MWF 9:00-10:00 AM',
  'Lab-101',
  1,  -- assuming teacher ID 1
  'ACTIVE',
  NOW(),
  NOW()
);

-- Get the course ID (let's assume it's 1)

-- 2. Enroll student in course
INSERT INTO "Enrollment" ("studentId", "courseId", status, "enrollmentDate", "createdAt", "updatedAt")
VALUES (
  1,  -- Rahul's student ID
  1,  -- Course ID
  'ACTIVE',
  NOW(),
  NOW(),
  NOW()
);

-- 3. Also add an attendance record if needed
-- INSERT INTO "Attendance" ("studentId", "courseId", date, status, "markedAt", "updatedAt")
-- VALUES (1, 1, NOW(), 'PRESENT', NOW(), NOW());
```

---

## After Enrollment

1. **Refresh** the student dashboard in browser
2. **Clear browser cache** if needed: Ctrl+Shift+Delete
3. Should now see:
   - ✅ Course in "My Courses" section
   - ✅ Course name, code, schedule, room
   - ✅ Enrollment count increased
   - ✅ Attendance percentage if records exist

---

## Troubleshooting

### Dashboard still shows "No courses enrolled"
- Check database: Has enrollment been created?
  ```sql
  SELECT * FROM "Enrollment" WHERE "studentId" = 1;
  ```

### Courses show but no schedule/room
- Check database: Course fields are not NULL
  ```sql
  SELECT id, name, schedule, room FROM "Course";
  ```

### Teacher name showing as "Not Assigned"
- Ensure `teacherId` is set correctly in Course
- Teacher with that ID must exist

---

## Complete Testing Workflow

1. **Login as Admin** → Should get ADMIN role token
2. **Create Course:**
   ```bash
   curl -X POST http://localhost:5000/api/courses \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"code":"CS101","name":"Programming","credits":3,"department":"CS","semester":1,"schedule":"MWF 9AM","room":"101","teacherId":1}'
   ```
3. **Enroll Student:**
   ```bash
   curl -X POST http://localhost:5000/api/courses/enroll \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"studentId":1,"courseId":1}'
   ```
4. **Login as Student** → Clear localStorage/cache
5. **View Dashboard** → Should show enrolled course ✅

---

## Sample Test Data

To populate test data quickly, use this SQL:

```sql
-- Assuming you have: User (id=1), Student (id=1), Teacher (id=1)

-- Create 3 courses
INSERT INTO "Course" (code, name, credits, department, semester, "teacherId", schedule, room, status, "createdAt", "updatedAt")
VALUES 
  ('CS101', 'Programming', 3, 'CS', 1, 1, 'MWF 9-10', 'Lab-101', 'ACTIVE', NOW(), NOW()),
  ('CS102', 'Data Structures', 3, 'CS', 2, 1, 'TTh 10-11', 'Lab-102', 'ACTIVE', NOW(), NOW()),
  ('CS103', 'Algorithms', 4, 'CS', 3, 1, 'MWF 2-3', 'Lab-103', 'ACTIVE', NOW(), NOW());

-- Enroll student in all 3 courses
INSERT INTO "Enrollment" ("studentId", "courseId", status, "enrollmentDate", "createdAt", "updatedAt")
VALUES
  (1, 1, 'ACTIVE', NOW(), NOW(), NOW()),
  (1, 2, 'ACTIVE', NOW(), NOW(), NOW()),
  (1, 3, 'ACTIVE', NOW(), NOW(), NOW());

-- Add some attendance records
INSERT INTO "Attendance" ("studentId", "courseId", date, status, "markedAt", "updatedAt")
VALUES
  (1, 1, NOW() - INTERVAL '5 days', 'PRESENT', NOW(), NOW()),
  (1, 1, NOW() - INTERVAL '3 days', 'PRESENT', NOW(), NOW()),
  (1, 1, NOW(), 'PRESENT', NOW(), NOW()),
  (1, 2, NOW() - INTERVAL '4 days', 'ABSENT', NOW(), NOW()),
  (1, 2, NOW() - INTERVAL '2 days', 'PRESENT', NOW(), NOW()),
  (1, 2, NOW(), 'PRESENT', NOW(), NOW());
```

After this, the student dashboard should show all 3 courses with attendance stats!

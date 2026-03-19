# Role-Based Access Control Testing Guide

## System Status
✅ Backend auth system fully implemented
✅ Frontend role guards configured
✅ Admin routes now mounted (FIXED)
⚠️ Admin creation workflow needs manual DB entry

---

## 1. STUDENT ROLE TESTING

### Create a Student Account
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "student@test.com",
  "password": "password123",
  "role": "STUDENT",
  "rollNo": "STU001",
  "course": "Computer Science",
  "semester": "1",
  "phone": "1234567890"
}
```

### Student Access Points
- ✅ Login at `/login`
- ✅ Dashboard at `/student/dashboard`
- ✅ Courses at `/student/courses`
- ✅ Attendance at `/student/attendance`
- ✅ Grades at `/student/grades`

### Student Permissions (Backend)
- Can view own dashboard
- Can view own courses
- Can view own attendance
- Can view own grades
- Cannot access admin or teacher endpoints

**Test Flow:**
1. Register with role: "STUDENT"
2. Login with credentials
3. Verify redirected to `/student/dashboard`
4. Try accessing `/admin/dashboard` → Should redirect to "/"

---

## 2. TEACHER ROLE TESTING

### Create a Teacher Account
```bash
POST /api/auth/register
{
  "name": "Prof. Smith",
  "email": "teacher@test.com",
  "password": "password123",
  "role": "TEACHER",
  "department": "Computer Science",
  "designation": "Associate Professor",
  "phone": "9876543210"
}
```

### Teacher Access Points
- ✅ Login at `/login`
- ✅ Dashboard at `/teacher/dashboard`
- ✅ Courses at `/teacher/courses`
- ✅ Students at `/teacher/students`
- ✅ Attendance at `/teacher/attendance`

### Teacher Permissions (Backend)
- Can view own profile
- Can view assigned courses
- Can view assigned students
- Can mark attendance
- Cannot access admin endpoints

**Test Flow:**
1. Register with role: "TEACHER"
2. Login with credentials
3. Verify redirected to `/teacher/dashboard`
4. Try accessing `/admin/dashboard` → Should redirect to "/"

---

## 3. ADMIN ROLE TESTING

### ⚠️ IMPORTANT: Create Admin via Database

Since admin registration is restricted to manual creation, follow these steps:

#### Option A: Using Prisma Studio (Recommended for Development)

```bash
# From Backend folder
npx prisma studio
```

Then:
1. Navigate to "User" table
2. Click "Add record"
3. Create with these fields:
   - `email`: admin@test.com
   - `password`: Hash of your password (or use bcrypt in Node)
   - `name`: Admin User
   - `role`: ADMIN
   - `isActive`: true

4. Navigate to "Admin" table
5. Create admin profile with:
   - `userId`: (ID from step 3)
   - `email`: admin@test.com
   - `name`: Admin User
   - `employeeId`: ADMIN001
   - `department`: Administration
   - `phone`: 5555555555

#### Option B: Using SQL (Direct Database)

```sql
-- Create admin user
INSERT INTO "User" (email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin@test.com',
  '$2a$10$...hashed_password_here...',
  'Admin User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- Create admin profile (replace userId with the ID from above)
INSERT INTO "Admin" ("userId", email, name, "employeeId", department, phone, "createdAt", "updatedAt")
VALUES (
  (SELECT id FROM "User" WHERE email = 'admin@test.com'),
  'admin@test.com',
  'Admin User',
  'ADMIN001',
  'Administration',
  '5555555555',
  NOW(),
  NOW()
);
```

**Note:** To hash a password using bcrypt:
```javascript
// Run in Node.js
const bcrypt = require('bcryptjs');
bcrypt.hash('your_password', 10).then(hash => console.log(hash));
```

### Admin Access Points
- ✅ Login at `/login`
- ✅ Dashboard at `/admin/dashboard`
- ✅ Students at `/admin/students`
- ✅ Teachers at `/admin/teachers`
- ✅ Courses at `/admin/courses`
- ✅ Attendance at `/admin/attendance`
- ✅ Trash at `/admin/trash`
- ✅ Logs at `/admin/logs`

### Admin Permissions (Backend)
- Can manage all students (create, read, update, delete)
- Can manage all teachers (create, read, update, delete)
- Can manage all courses
- Can manage attendance
- Can access trash/restore deleted items
- Can view system logs

**Test Flow:**
1. Create admin in database (see above)
2. Login with credentials
3. Verify redirected to `/admin/dashboard`
4. Try listing students: `GET /api/admin/students`
5. Try creating teacher via admin panel

---

## 4. AUTHORIZATION TESTING

### Test Unauthorized Access (Student trying to access Teacher endpoint)

```bash
# Login as student
# Get token from response

# Try to access teacher profile
curl -H "Authorization: Bearer STUDENT_TOKEN" \
  http://localhost:5000/api/teachers/profile
# Expected: 403 Forbidden or similar error
```

### Test Role Mismatch

```bash
# Valid teacher route (should work)
curl -H "Authorization: Bearer TEACHER_TOKEN" \
  http://localhost:5000/api/teachers/profile
# Expected: 200 OK with profile data

# Invalid route (student as admin)
curl -H "Authorization: Bearer STUDENT_TOKEN" \
  http://localhost:5000/api/admin/students
# Expected: 403 Forbidden
```

---

## 5. COMPLETE TEST CHECKLIST

### Authentication
- [ ] Student registration succeeds
- [ ] Teacher registration succeeds
- [ ] Duplicate email rejected
- [ ] Password < 6 characters rejected
- [ ] Student roll number required
- [ ] Teacher department required

### Login
- [ ] Student login works, returns STUDENT role
- [ ] Teacher login works, returns TEACHER role
- [ ] Admin login works, returns ADMIN role
- [ ] Invalid credentials rejected
- [ ] Inactive account rejected

### Frontend Routing
- [ ] Student redirected to `/student/dashboard`
- [ ] Teacher redirected to `/teacher/dashboard`
- [ ] Admin redirected to `/admin/dashboard`
- [ ] Student cannot access `/admin/*` (redirects to "/")
- [ ] Teacher cannot access `/admin/*` (redirects to "/")

### Backend Routes
- [ ] `/api/admin/students` - Only ADMIN can access
- [ ] `/api/admin/teachers` - Only ADMIN can access
- [ ] `/api/students/dashboard` - Only STUDENT can access
- [ ] `/api/teachers/profile` - Only TEACHER can access

### Token Validation
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Valid token allows access

---

## 6. COMMON ISSUES & SOLUTIONS

### Issue: "Not authenticated" on protected route
**Solution:** 
1. Check token is being sent in Authorization header
2. Verify token format: `Bearer <token>`
3. Check JWT_SECRET matches in .env

### Issue: Admin can't access routes
**Solution:**
1. Verify admin record exists in Admin table
2. Check user.role = 'ADMIN' in User table
3. Restart backend server (routes were just mounted)
4. Check Authorization header includes full role

### Issue: Role not recognized
**Solution:**
1. Ensure role is exactly: ADMIN, TEACHER, or STUDENT (uppercase)
2. Check localStorage for normalized role
3. Verify authMiddleware normalize function working

---

## 7. RECENT FIXES APPLIED

### ✅ Fix 1: Admin Routes Mounted
- **File:** `Backend/index.js`
- **Change:** Added missing import and mount for admin routes
- **Before:** Admin endpoints were unreachable
- **After:** `/api/admin/*` routes now functional

### ⏳ Pending: Admin Registration UI
- Currently admin must be created via database
- Consider adding admin registration endpoint with security checks

---

## 8. RUNNING THE FULL TEST

### Terminal 1: Start Backend
```bash
cd Backend
npm install
npm run dev
# Verify: "Server running on port 5000"
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm start
# Verify: App opens on localhost:3000
```

### Test Scenarios
1. **New User Flow:**
   - Go to `/login`
   - Click Register as Student
   - Fill form → Submit
   - Verify email, password work at login
   - Verify dashboard shows

2. **Role Validation:**
   - Create 3 test accounts (student, teacher, admin)
   - Test each can only access their routes
   - Test each cannot access others' routes

3. **Token Expiration:**
   - Set JWT expiry to 5 seconds for testing
   - Login → Wait 6 seconds
   - Try to access protected route
   - Verify gets 401 and redirected to login

---

## Database Connection Tip

If you need to manually verify user roles in the database:

```bash
# Using psql
psql -U your_user -d your_db_name
SELECT id, email, role, "isActive" FROM "User";
```

This will show all users and their roles for verification.

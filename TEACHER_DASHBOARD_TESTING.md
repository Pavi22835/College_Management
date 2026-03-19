# Staff Dashboard - Testing Guide

## System Status: ✅ FULLY FUNCTIONAL

All staff dashboard endpoints are properly implemented and routed.

---

## Staff Dashboard Components

### 1. **Dashboard Stats** (`/dashboard/stats`)
✅ **Endpoint:** `GET /api/teachers/dashboard/stats`
- **Calculates:**
  - Total courses taught
  - Total unique students (from direct assignment + course enrollments)
  - Average attendance (today's attendance / total students)

### 2. **Courses** (`/dashboard/courses`)
✅ **Endpoint:** `GET /api/teachers/dashboard/courses`
- **Returns:** All courses taught by teacher
- **Includes:**
  - Course name, code, department
  - Enrollment count
  - Schedule, room, status

### 3. **Students** (`/dashboard/students`)
✅ **Endpoint:** `GET /api/teachers/dashboard/students`
- **Returns:** All unique students
- **Students from:**
  - Direct assignment (teacherId in Student table)
  - Course enrollments (Enrollment table)
- **No duplicates** - uses Map for deduplication

### 4. **Today's Schedule** (`/dashboard/schedule/today`)
✅ **Endpoint:** `GET /api/teachers/dashboard/schedule/today`
- **Returns:** Courses scheduled for today
- **Logic:** Matches day of week in course schedule field

---

## Quick Test with Seeded Data

### **Test Account - Teacher**
```
Email: john.teacher@example.com
Password: teacher123
Role: TEACHER
Department: Computer Science
```

### **What You Should See:**

1. **Dashboard Header**
   - Welcome message with teacher name
   - Department and designation
   - Notification bell

2. **Stats Cards**
   - ✅ Courses: Should show courses taught
   - ✅ Students: Should show students
   - ✅ Attendance: Should show % (0% initially if no marking done)

3. **My Courses Section**
   - Shows courses this teacher teaches
   - Course code, name
   - Number of enrolled students
   - Schedule and room info
   - Click to view course details

4. **Recent Students Section**
   - Shows students enrolled in teacher's courses
   - Student name, roll number
   - Course and semester info

5. **Today's Schedule Section**
   - Shows only courses scheduled for today
   - Based on day name in schedule field

---

## How Data Flows

### Route Order (CRITICAL)
```javascript
// Teacher routes are defined FIRST (before generic /:id)
GET /teachers/profile              ← Teacher profile
GET /teachers/dashboard/stats      ← Dashboard stats
GET /teachers/dashboard/courses    ← Dashboard courses
GET /teachers/dashboard/students   ← Dashboard students
GET /teachers/dashboard/schedule/today ← Today's schedule

// Generic routes come LAST
GET /teachers/:id                  ← Admin - get teacher by ID (won't interfere)
```

### Frontend API Calls
```javascript
// TeacherDashboard.js calls 4 endpoints in parallel:
1. teacherApi.getDashboardStats()
2. teacherApi.getCourses()
3. teacherApi.getStudents()
4. teacherApi.getTodaySchedule()
```

### Response Format

**Stats Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCourses": 2,
      "totalStudents": 15,
      "todayAttendance": 12,
      "averageAttendance": 80
    }
  }
}
```

**Courses Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Programming",
      "department": "Computer Science",
      "semester": 3,
      "schedule": "MWF 9-10",
      "room": "Lab-101",
      "studentsCount": 5,
      "enrollments": [...]
    }
  ]
}
```

---

## Testing Steps

### Step 1: Run Seed (If Not Done)
```bash
cd Backend
npx prisma db seed
```
This creates:
- Teachers: john.teacher@example.com, sarah.teacher@example.com
- Courses: CS101 (taught by John), MATH101 (taught by Sarah)
- Enrollments: Ranjith & Rahul in CS101, Priya in MATH101
- Attendance records for all

### Step 2: Start Backend
```bash
npm run dev
# Should see: "Server running on port 5000"
```

### Step 3: Start Frontend
```bash
# In another terminal, from frontend folder
npm start
# Should open http://localhost:3000
```

### Step 4: Login as Teacher
- Click "Login" or navigate to `/login`
- Email: `john.teacher@example.com`
- Password: `teacher123`
- Click "Login"

### Step 5: Verify Dashboard
✅ **Stats Cards Show:**
- Courses: 1 (CS101)
- Students: 2 (Ranjith, Rahul)
- Attendance: Should calculate based on today's marking

✅ **My Courses Section:**
- Shows CS101
- Shows 2 students enrolled
- Shows schedule: "MWF 9-10"
- Shows room: "Lab-101"

✅ **Recent Students Section:**
- Shows Ranjith Kumar (2024001)
- Shows Rahul Sharma (2024003)
- Batch and section info

✅ **Today's Schedule:**
- Only shows if today is MWF (schedule must match)
- Shows CS101 if condition met

---

## Troubleshooting

### Issue: Dashboard shows 0 courses/students
**Solution:**
1. Check teacher is logged in correctly
2. Check browser console for API errors
3. Run query in database:
   ```sql
   SELECT id, name FROM "Teacher" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'john.teacher@example.com');
   SELECT id, name FROM "Course" WHERE "teacherId" = 1;
   SELECT COUNT(*) FROM "Enrollment" WHERE "courseId" IN (SELECT id FROM "Course" WHERE "teacherId" = 1);
   ```

### Issue: "Teacher not found" error
**Cause:** User logged in but Teacher profile doesn't exist
**Solution:**
1. Check both User and Teacher tables have matching records
2. Verify userId in Teacher table points to correct User

### Issue: Students showing but count is wrong
**Cause:** Duplicates in query
**Solution:**
- Backend already handles deduplication using Map
- Check database has unique enrollments:
  ```sql
  SELECT "studentId", "courseId", COUNT(*) FROM "Enrollment" 
  GROUP BY "studentId", "courseId" 
  HAVING COUNT(*) > 1;
  ```

### Issue: Attendance % shows 0%
**Cause:**
1. No attendance records marked for today
2. No students in courses yet
**Solution:**
- Mark attendance in Attendance management
- Or add sample attendance records:
  ```sql
  INSERT INTO "Attendance" ("studentId", "courseId", date, status, "markedAt", "updatedAt")
  VALUES (1, 1, NOW(), 'PRESENT', NOW(), NOW());
  ```

---

## API Testing with Postman/cURL

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/teachers/dashboard/stats \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

### Get Courses
```bash
curl -X GET http://localhost:5000/api/teachers/dashboard/courses \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

### Get Students
```bash
curl -X GET http://localhost:5000/api/teachers/dashboard/students \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

### Get Today's Schedule
```bash
curl -X GET http://localhost:5000/api/teachers/dashboard/schedule/today \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Complete Testing Checklist

### Authentication
- [ ] Teacher login succeeds with correct credentials
- [ ] Teacher redirected to `/teacher/dashboard`
- [ ] Token stored correctly in localStorage

### Dashboard Display
- [ ] Header shows teacher name and department
- [ ] Stats cards load without errors
- [ ] Courses section populated (if courses exist)
- [ ] Students section populated (if students exist)
- [ ] Schedule section shows (if today matches)

### Data Accuracy
- [ ] Stat numbers match database counts
- [ ] Course list includes all taught courses
- [ ] Student list has no duplicates
- [ ] Attendance % calculates correctly

### Navigation
- [ ] "View All" links navigate to course/student pages
- [ ] Click on course card navigates to course detail
- [ ] Logout button works

### Error Handling
- [ ] Graceful error messages on API failure
- [ ] Retry button works
- [ ] No console errors

### Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] 4-in-1 parallel API calls optimized
- [ ] No unnecessary re-renders

---

## Related Pages

Once dashboard works, test these related teacher pages:

1. **Teacher Courses** (`/teacher/courses`)
   - List of all courses taught
   - Course details, students enrolled
   - Attendance management

2. **Teacher Students** (`/teacher/students`)
   - List of all students
   - Filter by course
   - Student details and performance

3. **Teacher Attendance** (`/teacher/attendance`)
   - Mark attendance
   - View attendance history
   - Generate reports

4. **Teacher Profile** (`/teacher/profile`)
   - View profile info
   - Edit profile information
   - Change password

---

## Success Criteria

✅ All 4 dashboard API endpoints return success
✅ Dashboard displays all data correctly
✅ No console errors
✅ Data updates on page refresh
✅ Teacher can navigate between related pages
✅ Logout works and clears session

If all checks pass, **Staff Dashboard is fully functional!** 🎉

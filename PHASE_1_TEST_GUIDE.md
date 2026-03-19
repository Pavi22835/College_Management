# Quick Start Testing Guide - Phase 1 Admin Features

## 1. Get Admin Token

First, login as admin to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@college.edu",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**Save the token for all subsequent requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. User Management Tests

### Get All Users
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Get User Statistics
```bash
curl -X GET http://localhost:5000/api/admin/users/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Deactivate User (ID: 2)
```bash
curl -X PATCH http://localhost:5000/api/admin/users/2/deactivate \
  -H "Authorization: Bearer $TOKEN"
```

### Activate User (ID: 2)
```bash
curl -X PATCH http://localhost:5000/api/admin/users/2/activate \
  -H "Authorization: Bearer $TOKEN"
```

### Reset User Password (ID: 3)
```bash
curl -X PUT http://localhost:5000/api/admin/users/3/reset-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword123"
  }'
```

---

## 3. Department Management Tests

### Create Department
```bash
curl -X POST http://localhost:5000/api/admin/departments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS",
    "name": "Computer Science",
    "description": "Department of Computer Science & Engineering",
    "budget": 100000,
    "hodId": 5,
    "phone": "9876543210",
    "email": "cs@college.edu",
    "location": "Building A, 2nd Floor"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 1,
    "code": "CS",
    "name": "Computer Science",
    "description": "Department of Computer Science & Engineering",
    "budget": 100000,
    "hodId": 5,
    "phone": "9876543210",
    "email": "cs@college.edu",
    "location": "Building A, 2nd Floor",
    "hod": {
      "id": 5,
      "email": "teacher@college.edu",
      "name": "Dr. John Smith",
      "employeeId": "EMP001"
    }
  }
}
```

### Get All Departments
```bash
curl -X GET http://localhost:5000/api/admin/departments \
  -H "Authorization: Bearer $TOKEN"
```

### Get Department by ID
```bash
curl -X GET http://localhost:5000/api/admin/departments/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Department
```bash
curl -X PUT http://localhost:5000/api/admin/departments/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 120000,
    "phone": "9876543211"
  }'
```

### Delete Department (Soft Delete)
```bash
curl -X DELETE http://localhost:5000/api/admin/departments/1 \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## 4. Trash Management Tests

### View Trash
```bash
curl -X GET http://localhost:5000/api/admin/trash \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "entity": "DEPARTMENT",
      "entityId": 1,
      "data": { ... },
      "deletedBy": 1,
      "deletedAt": "2026-03-12T12:55:00Z",
      "expiresAt": "2026-04-11T12:55:00Z",
      "restoredAt": null,
      "restoredBy": null
    }
  ]
}
```

### Restore from Trash
```bash
curl -X POST http://localhost:5000/api/admin/trash/1/restore \
  -H "Authorization: Bearer $TOKEN"
```

### Permanently Delete from Trash
```bash
curl -X DELETE http://localhost:5000/api/admin/trash/1/permanent \
  -H "Authorization: Bearer $TOKEN"
```

### Empty Trash (Remove expired items)
```bash
curl -X DELETE http://localhost:5000/api/admin/trash/empty \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. PostgreSQL Verification Commands

Connect to database and verify data:

```sql
-- Check users in database
SELECT id, email, name, role, "isActive" FROM "User" ORDER BY id;

-- Check departments
SELECT * FROM "Department" WHERE "deletedAt" IS NULL ORDER BY id;

-- Check deleted departments in trash
SELECT entity, "entityId", "deletedAt", "expiresAt" FROM "Trash" 
WHERE entity = 'DEPARTMENT' ORDER BY "deletedAt" DESC;

-- Check activity logs
SELECT "userId", action, entity, "entityId", details, "createdAt" 
FROM "Log" ORDER BY "createdAt" DESC LIMIT 10;

-- Count users by role
SELECT role, COUNT(*) as count, COUNT(CASE WHEN "isActive" THEN 1 END) as active 
FROM "User" GROUP BY role;

-- Department with HOD information
SELECT d.id, d.code, d.name, d.budget, t.name as hod_name, t.email as hod_email
FROM "Department" d
LEFT JOIN "Teacher" t ON d."hodId" = t.id
WHERE d."deletedAt" IS NULL;
```

---

## 6. Expected HTTP Status Codes

### Success Responses
- **200 OK** - GET, PATCH, PUT operations successful
- **201 Created** - POST operations (create) successful

### Client Error Responses
- **400 Bad Request** - Validation error or duplicate data
  - Missing required fields
  - Invalid data format
  - Duplicate code/name for departments

- **403 Forbidden** - User lacks permission
  - Only admin can access these endpoints
  - Cannot deactivate own account

- **404 Not Found** - Resource not found
  - Invalid user ID
  - Invalid department ID
  - Invalid trash ID

### Server Error Responses
- **500 Internal Server Error** - Server-side error
  - Database connection issues
  - Unexpected errors

---

## 7. Testing Workflow

### Complete Test Sequence:
```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}' \
  | jq -r '.token')

# 2. Create department
curl -X POST http://localhost:5000/api/admin/departments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ME","name":"Mechanical Engineering","budget":80000}'

# 3. Get all departments (verify creation)
curl -X GET http://localhost:5000/api/admin/departments \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Delete department (soft delete)
curl -X DELETE http://localhost:5000/api/admin/departments/1 \
  -H "Authorization: Bearer $TOKEN"

# 5. Check trash (verify soft delete)
curl -X GET http://localhost:5000/api/admin/trash \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. Restore department
curl -X POST http://localhost:5000/api/admin/trash/1/restore \
  -H "Authorization: Bearer $TOKEN"

# 7. Get user statistics
curl -X GET http://localhost:5000/api/admin/users/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 8. Common Issues & Solutions

### Issue: Invalid Token
```
Error: "You do not have permission to access this page"
```
**Solution:** 
- Verify TOKEN variable is set correctly
- Get new token by logging in again
- Check token hasn't expired (7-day expiration)

### Issue: User Not Found
```
Error: "User not found"
```
**Solution:**
- Verify user ID exists in database
- Check SQL: `SELECT id, email FROM "User"`

### Issue: Department Code Already Exists
```
Error: "code already exists"
```
**Solution:**
- Use unique department codes
- Check existing: `SELECT code FROM "Department"`

### Issue: Cannot Delete Department with Courses
```
Error: "Cannot delete department with N active courses"
```
**Solution:**
- Delete or transfer courses first
- Or move courses to different department

---

## 9. API Response Time Performance

Expected response times:
- Get user list: <100ms (15 users)
- Get departments: <50ms
- Create department: <200ms (with HOD assignment)
- Delete/Restore: <150ms
- Database sync: <300ms

If slower, check:
- Database connection
- Network latency
- Server load
- Index usage (EXPLAIN ANALYZE)

---

## 10. Postman Collection

Use this in Postman:

```json
{
  "info": {"name": "Admin API Phase 1"},
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/login",
        "body": {"mode": "raw", "raw": "{\"email\":\"admin@college.edu\",\"password\":\"admin123\"}"}
      }
    },
    {
      "name": "Get Users",
      "request": {"method": "GET", "url": "http://localhost:5000/api/admin/users"},
      "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
    },
    {
      "name": "Create Department",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/admin/departments",
        "body": {"mode": "raw", "raw": "{\"code\":\"CS\",\"name\":\"Computer Science\"}"}
      },
      "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
    }
  ]
}
```

---

## Summary

✅ Phase 1 admin features are fully implemented and ready for testing  
✅ 15 new API endpoints available  
✅ Database schema updated with Department, Trash, and Log models  
✅ All endpoints are protected with admin authorization  
✅ Comprehensive error handling and validation in place  

**Next Step:** Create React frontend pages for admin dashboard (Phase 1b)

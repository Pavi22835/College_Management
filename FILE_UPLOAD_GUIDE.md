# Real File Upload Guide

## Overview
You can now upload **real data files** to lessons using the material upload feature. Files are stored on the server and persist even after page refresh.

## How It Works

### New Workflow
1. **Create Lesson** - Add title, duration, and description
2. **Upload Files** - Click the upload icon on the lesson card to add real files

### File Types Supported
- **PDF Files** (.pdf)
- **Word Documents** (.docx, .doc)
- **Videos** (.mp4, .mov, .mpeg)
- **Images** (.jpg, .jpeg, .png, .gif)
- **Spreadsheets** (.xls, .xlsx)
- **Max File Size**: 100MB per file

## Step-by-Step Instructions

### For Teachers (Staff)

#### Step 1: Login to Teacher Dashboard
- Email: `john.teacher@example.com` or `sarah.teacher@example.com`
- Password: `teacher123`

#### Step 2: Go to "My Courses"
- Click on a course to open course details

#### Step 3: Create a Lesson (if not already created)
- Click **"+ Add Lesson"** button
- Fill in:
  - **Title**: e.g., "Introduction to Data Science"
  - **Duration**: e.g., "30 mins"
  - **Description**: e.g., "Learn fundamentals of data science"
- **DON'T fill** in Video URL or PDF URL fields (they're removed!)
- Click **"Add Lesson"** button

#### Step 4: Upload Files to Lesson
- In the lesson card, look for the **upload icon** (📁 or ⬆️ button)
- Click the upload icon
- Select your file(s):
  - Course slides (PDF)
  - Video lectures (MP4)
  - Class notes (DOCX)
  - Any other learning material
- **File is automatically saved to the server**

#### Step 5: View/Manage Uploaded Files
- Files appear in the "Materials (X)" section below the lesson
- Each file shows:
  - File name
  - File size (in KB)
  - **Open** button - view/download the file
  - **Delete** button (🗑️) - remove the file

### Example: B.Sc Computer Science Course

**Test Scenario:**
1. Login as `john.teacher@example.com` (password: `teacher123`)
2. Open "B.Sc Computer Science" course
3. Click "Add Lesson" and create: "Week 1: Python Basics"
   - Title: Week 1: Python Basics
   - Duration: 1 hour
   - Description: Introduction to Python programming
4. Upload these files to the lesson:
   - `python-intro.pdf` (course slides)
   - `python-setup-video.mp4` (setup tutorial)
   - `hello_world.py` (code example)
   - `assignments.docx` (homework)

**Result:** All files persist on the server and are accessible to students!

## Behind the Scenes: Tech Stack

### File Storage
- **Location**: `Backend/uploads/materials/` folder on server
- **File Naming**: Files are renamed with timestamps to avoid conflicts
- **Example**: `python-intro-1743667200000-123456789.pdf`

### Database Storage
- **Table**: `Material` table in PostgreSQL
- **Fields Saved**:
  - File name and path
  - File size and MIME type
  - Uploader ID (teacher ID)
  - Upload timestamp
  - Associated lesson and course

### API Endpoints

#### Upload File to Lesson
```
POST /api/materials/lesson/{lessonId}/upload
Headers: Authorization: Bearer {token}
Body: FormData with 'file' field
Response: 201 Created with material details
```

#### Delete File from Material
```
DELETE /api/materials/{materialId}
Headers: Authorization: Bearer {token}
Response: 200 OK
```

#### Get Materials by Lesson
```
GET /api/materials/lesson/{lessonId}
Headers: Authorization: Bearer {token}
Response: 200 OK with materials array
```

## Data Persistence

### ✅ What Persists
- File stored on server disk
- File metadata in database
- All accessible after:
  - Page refresh
  - Server restart
  - Next login

### Files Served From
- Frontend can access files from: `http://localhost:3003/uploads/materials/{filename}`
- Files are served as static assets

## Test Credentials (All Ready to Use)

### Teachers
- **John Teacher** - john.teacher@example.com / teacher123
  - Teaches: B.Sc Computer Science (CS101)
  - Students: Ranjith Kumar, Rahul Sharma
  
- **Sarah Teacher** - sarah.teacher@example.com / teacher123
  - Teaches: B.Sc Mathematics (MATH101)
  - Students: Priya Sharma

### Students
- **Ranjith Kumar** - ranjith@example.com / student123
- **Priya Sharma** - priya@example.com / student123
- **Rahul Sharma** - rahul@example.com / student123

### Admin
- **Admin** - admin@example.com / admin123

## Troubleshooting

### File Upload Fails
**Issue**: Get error "Upload failed"

**Solutions**:
1. Check file size (max 100MB)
2. Check file type is supported
3. Ensure backend server is running (`http://localhost:3003/api/health`)
4. Check browser console for specific error

### Can't See Uploaded Files
**Issue**: File doesn't appear after upload

**Solutions**:
1. Refresh the page (F5)
2. Close and reopen the course
3. Check backend logs for errors
4. Ensure backend server is running

### File Won't Delete
**Issue**: Delete button doesn't work

**Solutions**:
1. Refresh the page
2. Check authorization (must be logged in as teacher)
3. Wait a moment and try again

## Advanced: Manual Server Restart

If needed to restart the backend:

```bash
# Navigate to backend folder
cd d:\College-Portal\Backend

# Kill existing process (if needed)
taskkill /PID [process_id] /F

# Restart server
node index.js
```

## Next Steps

1. **Test Upload**: Try uploading a real PDF or video file
2. **Share with Students**: Students can view these materials
3. **Organize Lessons**: Create multiple lessons with different materials per course
4. **Monitor Usage**: Check which students access which materials

---

**Last Updated**: April 2, 2026  
**Backend Status**: ✅ Running on http://localhost:3003  
**Database**: ✅ PostgreSQL synced and seeded  
**File Upload**: ✅ Ready for production use

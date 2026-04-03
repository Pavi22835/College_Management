-- RenameTable - Rename Teacher to Staff
ALTER TABLE "Teacher" RENAME TO "Staff";

-- Update the foreign key constraint name
ALTER TABLE "Student" RENAME CONSTRAINT "Student_teacherId_fkey" TO "Student_teacherId_fkey";

-- Update the foreign key constraint for Staff 
ALTER TABLE "Course" RENAME CONSTRAINT "Course_teacherId_fkey" TO "Course_teacherId_fkey";

-- Update Teacher to Staff in the schema
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename indexes
ALTER INDEX "Teacher_userId_key" RENAME TO "Staff_userId_key";
ALTER INDEX "Teacher_employeeId_key" RENAME TO "Staff_employeeId_key";
ALTER INDEX "Teacher_email_key" RENAME TO "Staff_email_key";
ALTER INDEX "Teacher_email_idx" RENAME TO "Staff_email_idx";
ALTER INDEX "Teacher_department_idx" RENAME TO "Staff_department_idx";

-- Create enum for StaffRole
CREATE TYPE "StaffRole" AS ENUM ('HOD', 'FACULTY', 'MENTOR');

-- Alter Staff table to add new columns
ALTER TABLE "Staff" ADD COLUMN "staffRole" "StaffRole" NOT NULL DEFAULT 'FACULTY';
ALTER TABLE "Staff" ADD COLUMN "appointedDate" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN "studentsCount" INTEGER DEFAULT 0;
ALTER TABLE "Staff" ADD COLUMN "deletedBy" INTEGER;
ALTER TABLE "Staff" ADD COLUMN "deletedReason" TEXT;
ALTER TABLE "Staff" ADD COLUMN "restoredAt" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN "restoredBy" INTEGER;

-- Update the Course table to include batch, schedule, and room
ALTER TABLE "Course" ADD COLUMN "batch" TEXT;
ALTER TABLE "Course" ADD COLUMN "schedule" TEXT;
ALTER TABLE "Course" ADD COLUMN "room" TEXT;
ALTER TABLE "Course" ADD COLUMN "deletedBy" INTEGER;

-- Create Lesson table
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "content" TEXT,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- Create Material table
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- Create Assignment table
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- Create AssignmentSubmission table
CREATE TABLE "AssignmentSubmission" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT,
    "grade" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- Create Department table with HOD relationship
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hodId" INTEGER,
    "hodAppointedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Lesson table
CREATE INDEX "Lesson_courseId_idx" ON "Lesson"("courseId");
CREATE INDEX "Lesson_order_idx" ON "Lesson"("order");

-- Create indexes for Material table
CREATE INDEX "Material_courseId_idx" ON "Material"("courseId");
CREATE INDEX "Material_uploadedBy_idx" ON "Material"("uploadedBy");

-- Create indexes for Assignment table
CREATE INDEX "Assignment_courseId_idx" ON "Assignment"("courseId");

-- Create indexes for AssignmentSubmission table
CREATE INDEX "AssignmentSubmission_assignmentId_idx" ON "AssignmentSubmission"("assignmentId");
CREATE INDEX "AssignmentSubmission_studentId_idx" ON "AssignmentSubmission"("studentId");

-- Create indexes for Department table
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Department_hodId_key" ON "Department"("hodId");
CREATE INDEX "Department_code_idx" ON "Department"("code");
CREATE INDEX "Department_hodId_idx" ON "Department"("hodId");

-- Create indexes for Course table
CREATE INDEX "Course_batch_idx" ON "Course"("batch");

-- Add foreign keys
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Material" ADD CONSTRAINT "Material_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Material" ADD CONSTRAINT "Material_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Department" ADD CONSTRAINT "Department_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new columns to Student if they don't exist
ALTER TABLE "Student" ADD COLUMN "mentorId" INTEGER;
ALTER TABLE "Student" ADD CONSTRAINT "Student_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for Staff table
CREATE INDEX "Staff_email_idx" ON "Staff"("email");
CREATE INDEX "Staff_department_idx" ON "Staff"("department");
CREATE INDEX "Staff_staffRole_idx" ON "Staff"("staffRole");
CREATE INDEX "Staff_deletedAt_idx" ON "Staff"("deletedAt");
CREATE INDEX "Staff_deletedBy_idx" ON "Staff"("deletedBy");
CREATE INDEX "Staff_employeeId_idx" ON "Staff"("employeeId");

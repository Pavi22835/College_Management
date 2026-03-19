import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting fresh database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // ========================================
  // 1. CREATE ADMIN
  // ========================================
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      admin: {
        create: {
          employeeId: 'ADM001',
          name: 'Admin User',
          email: 'admin@example.com',
          department: 'Administration',
          phone: '9876543210'
        }
      }
    }
  });
  console.log('✅ Admin created:', adminUser.email);

  // ========================================
  // 2. CREATE STAFF
  // ========================================
  const teacherUser = await prisma.user.upsert({
    where: { email: 'john.teacher@example.com' },
    update: {},
    create: {
      email: 'john.teacher@example.com',
      password: teacherPassword,
      name: 'John Teacher',
      role: 'STAFF',
      isActive: true,
      staff: {
        create: {
          employeeId: 'TCH001',
          name: 'John Teacher',
          email: 'john.teacher@example.com',
          department: 'Computer Science',
          designation: 'Professor',
          phone: '9876543211'
        }
      }
    }
  });
  console.log('✅ Staff John created:', teacherUser.email);

  const teacherUser2 = await prisma.user.upsert({
    where: { email: 'sarah.teacher@example.com' },
    update: {},
    create: {
      email: 'sarah.teacher@example.com',
      password: teacherPassword,
      name: 'Sarah Teacher',
      role: 'STAFF',
      isActive: true,
      staff: {
        create: {
          employeeId: 'TCH002',
          name: 'Sarah Teacher',
          email: 'sarah.teacher@example.com',
          department: 'Mathematics',
          designation: 'Associate Professor',
          phone: '9876543212'
        }
      }
    }
  });
  console.log('✅ Staff Sarah created:', teacherUser2.email);

  // ========================================
  // 3. GET STAFF IDs
  // ========================================
  const johnTeacher = await prisma.staff.findFirst({
    where: { name: 'John Teacher' }
  });
  
  const sarahTeacher = await prisma.staff.findFirst({
    where: { name: 'Sarah Teacher' }
  });

  console.log('📊 Staff IDs:', {
    john: johnTeacher?.id,
    sarah: sarahTeacher?.id
  });

  // ========================================
  // 4. CREATE STUDENTS
  // ========================================
  
  // Student 1: Ranjith (Assigned to John Teacher)
  const student1 = await prisma.user.upsert({
    where: { email: 'ranjith@example.com' },
    update: {},
    create: {
      email: 'ranjith@example.com',
      password: studentPassword,
      name: 'Ranjith Kumar',
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          rollNo: '2024001',
          enrollmentNo: 'ENR001',
          email: 'ranjith@example.com',
          name: 'Ranjith Kumar',
          age: 20,
          gender: 'Male',
          course: 'B.Sc Computer Science',
          semester: 3,
          batch: '2023-2026',
          section: 'A',
          phone: '9876543213',
          teacherId: johnTeacher?.id,
          fatherName: 'Ranjith Father',
          motherName: 'Ranjith Mother',
          guardianPhone: '9876543214',
          admissionYear: '2023',
          admissionType: 'Regular',
          previousCollege: 'Govt Higher Secondary School',
          previousPercentage: 85.5
        }
      }
    }
  });
  console.log('✅ Student Ranjith created (assigned to John Teacher)');

  // Student 2: Priya (Assigned to Sarah Teacher)
  const student2 = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      email: 'priya@example.com',
      password: studentPassword,
      name: 'Priya Sharma',
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          rollNo: '2024002',
          enrollmentNo: 'ENR002',
          email: 'priya@example.com',
          name: 'Priya Sharma',
          age: 19,
          gender: 'Female',
          course: 'B.Sc Mathematics',
          semester: 3,
          batch: '2023-2026',
          section: 'B',
          phone: '9876543215',
          teacherId: sarahTeacher?.id,
          fatherName: 'Priya Father',
          motherName: 'Priya Mother',
          guardianPhone: '9876543216',
          admissionYear: '2023',
          admissionType: 'Regular',
          previousCollege: 'St.Marys Higher Secondary',
          previousPercentage: 92.0
        }
      }
    }
  });
  console.log('✅ Student Priya created (assigned to Sarah Teacher)');

  // Student 3: Rahul (Assigned to John Teacher)
  const student3 = await prisma.user.upsert({
    where: { email: 'rahul@example.com' },
    update: {},
    create: {
      email: 'rahul@example.com',
      password: studentPassword,
      name: 'Rahul Sharma',
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          rollNo: '2024003',
          enrollmentNo: 'ENR003',
          email: 'rahul@example.com',
          name: 'Rahul Sharma',
          age: 21,
          gender: 'Male',
          course: 'B.Sc Computer Science',
          semester: 5,
          batch: '2022-2025',
          section: 'A',
          phone: '9876543217',
          teacherId: johnTeacher?.id,
          fatherName: 'Rahul Father',
          motherName: 'Rahul Mother',
          guardianPhone: '9876543218',
          admissionYear: '2022',
          admissionType: 'Regular',
          previousCollege: 'National College',
          previousPercentage: 78.5
        }
      }
    }
  });
  console.log('✅ Student Rahul created (assigned to John Teacher)');

  // ========================================
  // 5. CREATE COURSES
  // ========================================
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      name: 'B.Sc Computer Science',
      department: 'Computer Science',
      semester: 3,
      credits: 4,
      description: 'Bachelor of Science in Computer Science',
      teacherId: johnTeacher?.id,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Course created:', course1.name);

  const course2 = await prisma.course.upsert({
    where: { code: 'MATH101' },
    update: {},
    create: {
      code: 'MATH101',
      name: 'B.Sc Mathematics',
      department: 'Mathematics',
      semester: 3,
      credits: 4,
      description: 'Bachelor of Science in Mathematics',
      teacherId: sarahTeacher?.id,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Course created:', course2.name);

  // ========================================
  // 6. CREATE ENROLLMENTS
  // ========================================
  
  // Get student IDs
  const ranjith = await prisma.student.findFirst({ where: { email: 'ranjith@example.com' } });
  const priya = await prisma.student.findFirst({ where: { email: 'priya@example.com' } });
  const rahul = await prisma.student.findFirst({ where: { email: 'rahul@example.com' } });

  // Enroll Ranjith in CS101
  if (ranjith && course1) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: ranjith.id,
          courseId: course1.id
        }
      },
      update: {},
      create: {
        studentId: ranjith.id,
        courseId: course1.id,
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-06-01')
      }
    });
    console.log('✅ Enrollment created: Ranjith -> CS101');
  }

  // Enroll Priya in MATH101
  if (priya && course2) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: priya.id,
          courseId: course2.id
        }
      },
      update: {},
      create: {
        studentId: priya.id,
        courseId: course2.id,
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-06-01')
      }
    });
    console.log('✅ Enrollment created: Priya -> MATH101');
  }

  // Enroll Rahul in CS101
  if (rahul && course1) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: rahul.id,
          courseId: course1.id
        }
      },
      update: {},
      create: {
        studentId: rahul.id,
        courseId: course1.id,
        status: 'ACTIVE',
        enrollmentDate: new Date('2022-06-01')
      }
    });
    console.log('✅ Enrollment created: Rahul -> CS101');
  }

  // ========================================
  // 7. CREATE ATTENDANCE RECORDS
  // ========================================
  
  // Create attendance for Ranjith (10 records, 8 present, 2 absent = 80%)
  if (ranjith && course1) {
    for (let i = 1; i <= 10; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const status = i <= 8 ? 'PRESENT' : 'ABSENT';
      
      await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: ranjith.id,
            courseId: course1.id,
            date: date
          }
        },
        update: {},
        create: {
          studentId: ranjith.id,
          courseId: course1.id,
          date: date,
          status: status,
          remarks: status === 'PRESENT' ? 'On time' : 'Absent'
        }
      });
    }
    console.log('✅ Attendance created: Ranjith - 80% attendance');
  }

  // Create attendance for Rahul (10 records, 9 present, 1 absent = 90%)
  if (rahul && course1) {
    for (let i = 1; i <= 10; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const status = i <= 9 ? 'PRESENT' : 'ABSENT';
      
      await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: rahul.id,
            courseId: course1.id,
            date: date
          }
        },
        update: {},
        create: {
          studentId: rahul.id,
          courseId: course1.id,
          date: date,
          status: status,
          remarks: status === 'PRESENT' ? 'On time' : 'Absent'
        }
      });
    }
    console.log('✅ Attendance created: Rahul - 90% attendance');
  }

  // Create attendance for Priya (10 records, 7 present, 3 absent = 70%)
  if (priya && course2) {
    for (let i = 1; i <= 10; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const status = i <= 7 ? 'PRESENT' : 'ABSENT';
      
      await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: priya.id,
            courseId: course2.id,
            date: date
          }
        },
        update: {},
        create: {
          studentId: priya.id,
          courseId: course2.id,
          date: date,
          status: status,
          remarks: status === 'PRESENT' ? 'On time' : 'Absent'
        }
      });
    }
    console.log('✅ Attendance created: Priya - 70% attendance');
  }

  // ========================================
  // 8. VERIFY TEACHER-STUDENT RELATIONSHIP
  // ========================================
  const johnsStudents = await prisma.student.findMany({
    where: { teacherId: johnTeacher?.id },
    include: { teacher: true }
  });

  const sarahsStudents = await prisma.student.findMany({
    where: { teacherId: sarahTeacher?.id },
    include: { teacher: true }
  });

  console.log('\n📊 TEACHER-STUDENT RELATIONSHIP SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👨‍🏫 John Teacher (ID: ${johnTeacher?.id}) has ${johnsStudents.length} student(s):`);
  johnsStudents.forEach(s => console.log(`   • ${s.name} (Roll: ${s.rollNo}, Course: ${s.course})`));
  
  console.log(`\n👩‍🏫 Sarah Teacher (ID: ${sarahTeacher?.id}) has ${sarahsStudents.length} student(s):`);
  sarahsStudents.forEach(s => console.log(`   • ${s.name} (Roll: ${s.rollNo}, Course: ${s.course})`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ========================================
  // 9. FINAL SUMMARY
  // ========================================
  console.log('\n✅✅✅ DATABASE SEEDED SUCCESSFULLY! ✅✅✅');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 LOGIN CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('TEACHERS:');
  console.log('   1. John Teacher (Computer Science)');
  console.log('      Email: john.teacher@example.com');
  console.log('      Password: teacher123');
  console.log('      Students: Ranjith, Rahul');
  console.log('');
  console.log('   2. Sarah Teacher (Mathematics)');
  console.log('      Email: sarah.teacher@example.com');
  console.log('      Password: teacher123');
  console.log('      Students: Priya');
  console.log('');
  console.log('STUDENTS:');
  console.log('   1. Ranjith Kumar (John Teacher)');
  console.log('      Email: ranjith@example.com');
  console.log('      Password: student123');
  console.log('      Attendance: 80%');
  console.log('');
  console.log('   2. Priya Sharma (Sarah Teacher)');
  console.log('      Email: priya@example.com');
  console.log('      Password: student123');
  console.log('      Attendance: 70%');
  console.log('');
  console.log('   3. Rahul Sharma (John Teacher)');
  console.log('      Email: rahul@example.com');
  console.log('      Password: student123');
  console.log('      Attendance: 90%');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
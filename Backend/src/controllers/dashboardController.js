import prisma from "../prisma/client.js";

export const getDashboardStats = async (req, res) => {
  try {

    const students = await prisma.student.count({
      where: { deletedAt: null }
    });

    const teachers = await prisma.teacher.count({
      where: { deletedAt: null }
    });

    const courses = await prisma.course.count({
      where: { deletedAt: null }
    });

    const recentStudents = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    res.json({
      success: true,
      data: {
        totals: {
          students,
          teachers,
          courses
        },
        recentStudents
      }
    });

  } catch (error) {

    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Dashboard error"
    });

  }
};
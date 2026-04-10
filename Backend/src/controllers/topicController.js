import prisma from "../prisma/client.js";

export const createTopic = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, duration } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Topic title is required"
      });
    }
    
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) }
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }
    
    const maxOrder = await prisma.topic.aggregate({
      where: { lessonId: parseInt(lessonId) },
      _max: { order: true }
    });
    
    const newOrder = (maxOrder._max.order ?? -1) + 1;
    
    const topic = await prisma.topic.create({
      data: {
        title,
        description: description || null,
        duration: duration || null,
        order: newOrder,
        lessonId: parseInt(lessonId)
      }
    });
    
    res.status(201).json({
      success: true,
      data: topic,
      message: "Topic created successfully"
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create topic"
    });
  }
};

export const getTopicsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const topics = await prisma.topic.findMany({
      where: { lessonId: parseInt(lessonId) },
      orderBy: { order: "asc" }
    });
    
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics"
    });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, description, duration, order } = req.body;
    
    const topic = await prisma.topic.update({
      where: { id: parseInt(topicId) },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        duration: duration !== undefined ? duration : undefined,
        order: order !== undefined ? order : undefined
      }
    });
    
    res.json({
      success: true,
      data: topic,
      message: "Topic updated successfully"
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update topic"
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    
    await prisma.topic.delete({
      where: { id: parseInt(topicId) }
    });
    
    res.json({
      success: true,
      message: "Topic deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete topic"
    });
  }
};
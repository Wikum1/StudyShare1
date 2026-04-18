const { answerQuestionFromKnowledgeBase } = require("../services/ragService");

const askChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const lowerMessage = message.trim().toLowerCase();
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];

    if (greetings.includes(lowerMessage)) {
      return res.status(200).json({
        success: true,
        answer:
          "Hello! I am your Academic Assistant. Ask me about modules, assignments, notices, deadlines, or study-related academic questions.",
        sources: [],
      });
    }

    const result = await answerQuestionFromKnowledgeBase(message);

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources || [],
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing chatbot request",
      error: error.message,
    });
  }
};

module.exports = { askChatbot };
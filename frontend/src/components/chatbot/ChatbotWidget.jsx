import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircleMore, X, Send } from "lucide-react";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I am your Academic Assistant. Ask me about modules, assignments, deadlines, uploads, or study planning.",
      sources: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const addBotMessage = (text, sources = []) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text,
        sources,
      },
    ]);
  };

  const sendMessage = async (customMessage = null) => {
    const userText = customMessage ? customMessage.trim() : input.trim();

    if (!userText) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userText,
        sources: [],
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chatbot/ask", {
        message: userText,
      });

      addBotMessage(
        response.data?.answer || "Sorry, I could not find a clear answer.",
        response.data?.sources || []
      );
    } catch (error) {
      console.error("Chatbot frontend error:", error);
      console.error("Response data:", error?.response?.data);
      console.error("Response status:", error?.response?.status);

      addBotMessage("Something went wrong while getting the answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleQuickAction = (question) => {
    sendMessage(question);
  };

  return (
    <>
      <button
        className="chatbot-floating-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open chatbot"
        title="Academic Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircleMore size={24} />}
      </button>

      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <div>
              <h3>Academic Assistant</h3>
              <p>Ask about university academic matters</p>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${msg.sender}`}
              >
                <div className={`chatbot-message ${msg.sender}`}>
                  <div>{msg.text}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="chatbot-sources">
                      Source: {msg.sources.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-message bot">Typing...</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            <button onClick={() => handleQuickAction("What is this system used for?")}>
              System usage
            </button>
            <button onClick={() => handleQuickAction("How do I upload a resource?")}>
              Upload resource
            </button>
            <button onClick={() => handleQuickAction("How do I create a study plan?")}>
              Study plan
            </button>
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => sendMessage()} aria-label="Send message">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
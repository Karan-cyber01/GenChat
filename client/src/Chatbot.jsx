import React, { useState } from "react";
import axios from "axios";

// Access the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to call Google Gemini API
  const callGeminiAPI = async (userInput) => {
    const MODEL = "gemini-1.5-flash";
    
    // Check if API key is available
    if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
      return "⚠️ Please add your Gemini API key to the .env file to start chatting!";
    }
    
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: userInput }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Extract the response text
      const botResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (botResponse) {
        return botResponse;
      } else {
        return "Sorry, I couldn't generate a response. Please try again.";
      }
      
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return "❌ Invalid API key or request format. Please check your Gemini API key.";
      } else if (error.response?.status === 403) {
        return "❌ API key doesn't have permission to access Gemini. Please check your API key settings.";
      } else if (error.response?.status === 429) {
        return "⏳ Too many requests. Please wait a moment and try again.";
      } else {
        return "❌ Failed to connect to Gemini API. Please check your internet connection and try again.";
      }
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add user message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Get bot response
    const botReply = await callGeminiAPI(input);
    const botMessage = { text: botReply, sender: "bot" };
    
    // Add bot message to chat
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">🤖 Gemini AI Chatbot</h5>
        </div>
        <div className="card-body overflow-auto" style={{ height: "400px" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${
                msg.sender === "user" ? "justify-content-end" : ""
              }`}
            >
              <div
                className={`p-3 rounded ${
                  msg.sender === "bot"
                    ? "bg-light text-dark border"
                    : "bg-primary text-white"
                }`}
                style={{ maxWidth: "75%" }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-muted">
              <em>🤔 Bot is thinking...</em>
            </div>
          )}
        </div>
        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSend}
              disabled={loading || input.trim() === ""}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
      
      {/* API Key Status Indicator */}
      <div className="mt-3 text-center">
        <small className="text-muted">
          API Status: {API_KEY && API_KEY !== "your_gemini_api_key_here" ? 
            "🟢 Connected" : "🔴 API Key Required"}
        </small>
      </div>
    </div>
  );
};

export default Chatbot;

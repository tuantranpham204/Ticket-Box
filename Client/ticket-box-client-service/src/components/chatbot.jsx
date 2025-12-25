import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hey yoo! I'm your ticket assistant. What tickets are you looking for today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Gọi API Python (Lưu ý cổng 8000 phải đang bật)
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          session_id: "guest_user", // Có thể thay bằng ID user thật
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.answer, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connect to server AI!", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Nút tròn ở góc */}
      <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleBtn}>
        💬
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span>Trợ lý ảo Ticket-Box</span>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              ×
            </button>
          </div>

          <div style={styles.body}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(msg.sender === "bot" ? styles.botMsg : styles.userMsg),
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.message, ...styles.botMsg }}>
                Finding...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.footer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about event..."
              style={styles.input}
            />
            <button onClick={handleSend} style={styles.sendBtn}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS Inline (Gọn, không cần file .css riêng)
// --- SỬA LẠI PHẦN STYLE NÀY TRONG FILE Chatbot.jsx ---

const styles = {
  toggleBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 99999, // <--- Tăng lên thật cao để luôn nổi lên trên
    transition: "transform 0.2s",
  },
  chatWindow: {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "350px",
    height: "480px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)", // Đậm hơn chút cho đẹp
    display: "flex",
    flexDirection: "column",
    zIndex: 99999, // <--- Tăng lên thật cao
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  // ... (Giữ nguyên header, closeBtn, body, message...)
  header: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "12px 16px",
    fontWeight: "600",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "15px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
  },
  body: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#333", // <--- THÊM: Ép màu chữ trong khung chat là màu đen
  },
  message: {
    padding: "8px 12px",
    borderRadius: "16px",
    maxWidth: "85%",
    fontSize: "14px",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },
  botMsg: {
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
  },
  userMsg: {
    backgroundColor: "#3b82f6",
    color: "white",
    alignSelf: "flex-end",
    borderBottomRightRadius: "4px",
  },
  footer: {
    padding: "12px",
    display: "flex",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "white",
    gap: "8px",
  },

  // 👇 QUAN TRỌNG NHẤT LÀ PHẦN NÀY
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    color: "black", // <--- BẮT BUỘC: Màu chữ đen (đè lên màu trắng của layout)
    backgroundColor: "white", // Đảm bảo nền trắng
  },

  sendBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};

export default Chatbot;

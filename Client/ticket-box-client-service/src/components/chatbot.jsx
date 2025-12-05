import React, { useState } from "react";

const ChatbotV1 = () => {
  const [show, setShow] = useState(false);
  const [list, setList] = useState([{ text: "Chào bạn, tôi là bot hỗ trợ tìm vé.", type: "bot" }]);
  const [msg, setMsg] = useState("");

  const sendMsg = () => {
    if (!msg.trim()) return;
    setList([...list, { text: msg, type: "user" }, { text: "Hệ thống đang tìm kiếm...", type: "bot" }]);
    setMsg("");
  };

  return (
    <div style={{ position: "fixed", bottom: "15px", right: "15px", fontFamily: "Arial", zIndex: 10000 }}>
      <button 
        onClick={() => setShow(!show)} 
        style={{ 
          padding: "10px 20px", 
          cursor: "pointer", 
          borderRadius: "20px", 
          border: "1px solid #ccc",
          background: "#f0f0f0"
        }}
      >
        Hỗ trợ trực tuyến
      </button>

      {show && (
        <div style={{ 
          width: "320px", 
          height: "450px", 
          border: "1px solid #ddd", 
          display: "flex", 
          flexDirection: "column", 
          background: "white",
          marginTop: "10px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ background: "#f5f5f5", padding: "12px", borderBottom: "1px solid #ddd" }}>
            <b style={{ fontSize: "14px" }}>Ticket-Box Support (Beta)</b>
          </div>

          <div style={{ flex: 1, padding: "15px", overflowY: "auto", background: "#ffffff" }}>
            {list.map((item, i) => (
              <div key={i} style={{ 
                marginBottom: "12px", 
                display: "flex",
                justifyContent: item.type === "user" ? "flex-end" : "flex-start" 
              }}>
                <div style={{ 
                  maxWidth: "80%",
                  padding: "8px 12px", 
                  borderRadius: "15px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  background: item.type === "user" ? "#007bff" : "#e9e9eb",
                  color: item.type === "user" ? "white" : "black",
                  borderTopRightRadius: item.type === "user" ? "2px" : "15px",
                  borderTopLeftRadius: item.type === "bot" ? "2px" : "15px"
                }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px", borderTop: "1px solid #eee", display: "flex" }}>
            <input 
              style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px", outline: "none" }} 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)} 
              placeholder="Nhập nội dung..."
            />
            <button onClick={sendMsg} style={{ marginLeft: "5px", padding: "0 10px", cursor: "pointer" }}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotV1;
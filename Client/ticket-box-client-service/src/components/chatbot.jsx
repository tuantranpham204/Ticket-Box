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
    <div style={{ position: "fixed", bottom: "15px", right: "15px", fontFamily: "Arial" }}>
      <button onClick={() => setShow(!show)} style={{ padding: "8px 15px", cursor: "pointer" }}>
        Hỗ trợ trực tuyến
      </button>

      {show && (
        <div style={{ width: "320px", height: "420px", border: "1px solid #999", display: "flex", flexDirection: "column", background: "white" }}>
          <div style={{ background: "#eee", padding: "10px", borderBottom: "1px solid #999" }}>
            <b>Ticket-Box Support</b>
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {list.map((item, i) => (
              <div key={i} style={{ 
                marginBottom: "10px", 
                textAlign: item.type === "user" ? "right" : "left" 
              }}>
                <span style={{ 
                  display: "inline-block", 
                  padding: "5px 10px", 
                  background: item.type === "user" ? "#e1ffc7" : "#f1f0f0",
                  border: "1px solid #ccc"
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px", borderTop: "1px solid #999" }}>
            <input 
              style={{ width: "75%", padding: "5px" }} 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)} 
            />
            <button onClick={sendMsg} style={{ width: "20%", marginLeft: "5%" }}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotV1;
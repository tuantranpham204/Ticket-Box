import google.generativeai as genai
import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Config
GOOGLE_API_KEY = "AIzaSyBLkYfRLw8s7k74sWTXnJE0999Dc_Q6m90"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_context():
    try:
        with open("../data-processing/output/data_tach_success.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

class ChatReq(BaseModel):
    question: str

@app.post("/chat")
async def handle_chat(req: ChatReq):
    events = load_context()
    
    # Prompt Engineering nâng cao (Few-shot & Constraints)
    prompt = f"""
    [SYSTEM ROLE]
    Bạn là Đại diện Chăm sóc Khách hàng của Ticket-Box. Phong cách: Nhiệt tình, chuyên nghiệp, hỗ trợ tối đa.

    [CONTEXT DATA]
    Dữ liệu sự kiện hiện tại (JSON): {json.dumps(events, ensure_ascii=False)}

    [OBJECTIVES]
    1. Cung cấp thông tin vé chính xác theo dữ liệu được cung cấp.
    2. Nếu có nhiều sự kiện khớp, hãy liệt kê dưới dạng danh sách.
    3. Luôn kết thúc bằng một câu gợi mở (Ví dụ: "Bạn có muốn mình hỗ trợ đặt vé không?").

    [CONSTRAINTS - RÀNG BUỘC]
    - KHÔNG được bịa đặt thông tin không có trong Context.
    - KHÔNG trả lời các câu hỏi ngoài lề không liên quan đến Ticket-Box hoặc sự kiện.
    - Nếu khách hỏi về giá vé mà trong data không có, hãy báo "Giá vé đang được cập nhật".
    - Sử dụng tiếng Việt chuẩn, không dùng ngôn ngữ teen.

    [OUTPUT FORMAT]
    - Tên sự kiện: [VIẾT HOA ĐẬM]
    - Thời gian: [Ngày/Tháng/Năm]
    - Địa điểm: [Tên địa điểm]
    - Giá: [Giá tiền hoặc trạng thái]

    [USER QUESTION]
    {req.question}
    """
    
    response = model.generate_content(prompt)
    return {"answer": response.text}
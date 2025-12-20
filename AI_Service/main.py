import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.utilities import SQLDatabase
from fastapi.middleware.cors import CORSMiddleware

# --- 1. CẤU HÌNH ---
# Thay API Key của bạn vào đây
GOOGLE_API_KEY = "AIzaSyAGV4PwA6TUr7LFGRr2bR8JjafN0c1hO2k" 

# Cấu hình Database (Thay password của bạn)
db_user = "root"
db_password = "123456" 
db_host = "localhost"
db_name = "ticket_box"

# Cấu hình Google GenAI (Trực tiếp)
genai.configure(api_key=GOOGLE_API_KEY)
# Dùng model Flash (Nhanh, Free)
model = genai.GenerativeModel('gemini-2.5-flash-lite')

app = FastAPI()

# Cấu hình CORS để React gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối Database
try:
    db = SQLDatabase.from_uri(f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}")
    print("✅ Kết nối Database thành công!")
except Exception as e:
    print(f"❌ Lỗi kết nối Database: {e}")

class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"

# --- 2. HÀM XỬ LÝ ---

def get_sql_query(question: str, schema: str):
    """Bước 1: Sinh SQL"""
    prompt = f"""
    Bạn là chuyên gia SQL MySQL.
    Schema database: 
    {schema}
    
    Câu hỏi: {question}
    
    Yêu cầu: 
    1. Trả về 01 câu lệnh SQL duy nhất.
    2. Dùng LIKE %...% nếu tìm tên.
    3. Không giải thích, không markdown (```sql).
    """
    response = model.generate_content(prompt)
    return response.text.replace("```sql", "").replace("```", "").strip()

def get_natural_response(question: str, sql_result: str):
    """Bước 2: Trả lời tự nhiên (Format đẹp)"""
    prompt = f"""
    Bạn là trợ lý ảo Ticket-Box.
    Câu hỏi: "{question}"
    Dữ liệu từ DB: "{sql_result}"
    
    YÊU CẦU ĐỊNH DẠNG (QUAN TRỌNG):
    1. Trả lời dưới dạng văn bản thô (Plain text), TUYỆT ĐỐI KHÔNG dùng dấu ** hay ##.
    2. Mỗi sự kiện bắt buộc phải cách nhau một dòng trống.
    3. Mỗi thông tin (Tên, Thời gian, Địa điểm) phải nằm trên một dòng riêng biệt.
    
    MẪU TRẢ LỜI MONG MUỐN:
    
    1. Tên sự kiện: Nhạc hội Mùa Thu
    - Thời gian: 14/11/2025
    - Địa điểm: Văn Miếu
    - xuống dòng
    2. Tên sự kiện: Triển lãm Tranh
    - Thời gian: 15/11/2025
    - Địa điểm: Bảo tàng Mỹ thuật
    -xuống dòng
    (Cuối cùng thêm câu: Bạn muốn đặt vé sự kiện nào không?)
    
    Nếu dữ liệu rỗng: "Hiện tại chưa có sự kiện nào phù hợp."
    """
    response = model.generate_content(prompt)
    return response.text

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Lấy schema
        schema_info = db.get_table_info()
        
        # 2. Sinh SQL
        generated_sql = get_sql_query(request.question, schema_info)
        print(f"🔹 SQL: {generated_sql}")
        
        # 3. Chạy SQL
        try:
            result = db.run(generated_sql)
            print(f"🔹 Kết quả: {result}")
        except Exception as e:
            return {"answer": "Lỗi truy vấn dữ liệu."}
            
        # 4. Trả lời
        final_answer = get_natural_response(request.question, result)
        
        return {
            "answer": final_answer,
            "sql_debug": generated_sql
        }

    except Exception as e:
        print(f"Lỗi Server: {e}")
        raise HTTPException(status_code=500, detail=str(e))
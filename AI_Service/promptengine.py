import google.generativeai as genai
import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

KEY = "AIzaSyAGV4PwA6TUr7LFGRr2bR8JjafN0c1hO2k"
genai.configure(api_key=KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_data():
    try:
        f = open("../data-processing/output/data_tach_success.json", "r", encoding="utf-8")
        d = json.load(f)
        f.close()
        return d
    except:
        return []

class Req(BaseModel):
    question: str

@app.post("/chat")
async def chat(r: Req):
    db_json = get_data()
    
    prompt = f"""
    Role: Ticket-Box Support V1
    Data: {json.dumps(db_json, ensure_ascii=False)}
    User: {r.question}
    
    Rules:
    - Tra loi ngan gon theo data json.
    - Neu khong co thi bao khong tim thay.
    - Format: Ten, Ngay, Gia (moi cai 1 dong).
    """
    
    res = model.generate_content(prompt)
    return {"answer": res.text}
import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.utilities import SQLDatabase
from fastapi.middleware.cors import CORSMiddleware

# ==========================================
# 1. SYSTEM CONFIGURATION
# ==========================================
GOOGLE_API_KEY = "AIzaSyDKp-m2-797JO4RBbnTPY9xLqbDfnhNSx0"

db_user = "root"
db_password = "123456"
db_host = "localhost"
db_name = "ticket_box"

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash-lite')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    db = SQLDatabase.from_uri(f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}")
    print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection error: {e}")


class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"
    user_id: str = "1"
    user_location: str = None  # Receive location from Frontend


# ==========================================
# 2. SMART PROCESSING FUNCTIONS
# ==========================================

def get_relevant_tables(question: str, all_table_names: list):
    """
    [PROMPT 1] Table Filtering: Helps AI focus when DB is large
    """
    tables_str = ", ".join(all_table_names)
    prompt = f"""
    You are a Database Assistant. Table list: {tables_str}
    Question: "{question}"
    Task: Select necessary tables.
    NOTE: 
    - If asking "who is participating", "singer", "artist": MUST select 'events' table.
    - If asking TICKET PRICE: Select event table + price table.
    - Need SUGGESTION/HISTORY: Select 'orders' table.
    Return a comma-separated list of table names.
    """
    try:
        response = model.generate_content(prompt)
        selected = response.text.strip().split(',')
        final_tables = [t.strip() for t in selected if t.strip() in all_table_names]
        return final_tables if final_tables else all_table_names
    except:
        return all_table_names


def get_user_preferences(user_id: str, schema: str):
    """ [PROMPT 2] Find preferences: For personalized suggestions """
    prompt = f"""
    Write SQL to find CATEGORIES (Category/Genre) that user_id = '{user_id}' buys the most.
    Schema: {schema}
    Requirement: SELECT category, COUNT(*) ... GROUP BY ... ORDER BY count DESC LIMIT 3.
    Return SQL only.
    """
    try:
        response = model.generate_content(prompt)
        sql = response.text.replace("```sql", "").replace("```", "").strip()
        result = db.run(sql)
        if not result or result == "[]" or result == "None": return None
        return result
    except:
        return None


def generate_sql_smart(question: str, schema: str, user_prefs: str = None, user_location: str = None,
                       error_msg: str = None, old_sql: str = None):
    """
    [PROMPT 3 - MOST IMPORTANT] Generate Comprehensive SQL
    """
    # --- Prompt: Self-Healing ---
    context_instruction = ""
    if error_msg:
        context_instruction = f"⚠️ Previous attempt failed: {error_msg}. Fix it immediately."

    # --- Prompt: Personalization ---
    preference_rule = ""
    if user_prefs:
        preference_rule = f"❤️ PERSONALIZED SUGGESTION: User likes {user_prefs}. Prioritize filtering by this category."

    # --- Prompt: Location (New) ---
    location_rule = ""
    if user_location:
        location_rule = f"""
        📍 LOCATION: User is at "{user_location}".
        - If asking generally (e.g., "what's good", "events"), PRIORITIZE finding events with location LIKE '%{user_location}%'.
        """

    # --- Prompt: Business Rules (Old) ---
    business_rules = """
    BUSINESS RULES (MANDATORY):
    1. HANDLE "PARTICIPANTS": Get `description` or `content` column in `events` table.
    2. HANDLE "THIS EVENT": Find the latest event (ORDER BY id DESC LIMIT 1).
    3. MAPPING: "concert"/"music" -> Music/Concert; "play"/"theater" -> Theater.
    4. TICKET PRICE: If events table has no price, MUST JOIN child table (ticket_types...).
    5. TIME: "upcoming" -> date >= CURDATE().
    """

    # --- COMBINE ALL INTO ONE GIANT PROMPT ---
    prompt = f"""
    You are an SQL Expert. Schema: {schema}

    {business_rules}   <-- Business rules
    {preference_rule}  <-- Preference prompt
    {location_rule}    <-- Location prompt
    {context_instruction} <-- Self-healing prompt

    Question: "{question}"

    REQUIREMENT: Return 1 single SQL query. LIMIT 5.
    """
    response = model.generate_content(prompt)
    return response.text.replace("```sql", "").replace("```", "").strip()


def get_natural_response(question: str, sql_result: str, user_prefs: str = None):
    """ [PROMPT 4] Natural Response: Read Description & Handle Nulls """
    intro = ""
    # Keywords: suggest, recommend, what's good
    if user_prefs and any(x in question.lower() for x in ["suggest", "recommend", "what's good", "advice"]):
        intro = "(Based on your preferences:)\n"

    prompt = f"""
    Ticket Sales Bot.
    Question: "{question}"
    DB Result: "{sql_result}"

    INSTRUCTIONS:
    1. {intro}
    2. If list is empty []: Say "No suitable events found".
    3. If event exists but value is NULL -> "Found [Name], but details are not available yet."
    4. HANDLE DESCRIPTION: If asked "Who is participating", READ THE DESCRIPTION in the data to find names.
    5. Present clearly, do not use markdown (**).
    """
    response = model.generate_content(prompt)
    return response.text


# ==========================================
# 3. MAIN ENDPOINT
# ==========================================

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"🔹 User: {request.user_id} | 📍 Loc: {request.user_location} | ❓: {request.question}")

        # B1: Filter Tables
        all_tables = db.get_table_names()
        relevant_tables = get_relevant_tables(request.question, all_tables)

        # B2: Get Schema
        schema_info = db.get_table_info(table_names=relevant_tables if relevant_tables else None)

        # B3: Check Preferences
        user_prefs = None
        # Updated keywords to English for consistency
        if any(k in request.question.lower() for k in ["suggest", "recommend", "what's good", "advice", "gợi ý"]):
            user_prefs = get_user_preferences(request.user_id, schema_info)

        # B4: Generate SQL (Try 3 times)
        max_retries = 3
        current_sql = ""
        sql_result = ""
        last_error = None
        success = False

        for attempt in range(max_retries):
            try:
                # Call SQL generation with all parameters
                current_sql = generate_sql_smart(
                    request.question,
                    schema_info,
                    user_prefs,
                    request.user_location,
                    last_error,
                    current_sql
                )
                print(f"⚙️ SQL: {current_sql}")

                sql_result = db.run(current_sql)
                print(f"✅ DB: {sql_result}")
                success = True
                break
            except Exception as e:
                print(f"❌ SQL Error: {e}")
                last_error = str(e)

        if not success:
            return {"answer": "System is busy, please try asking a shorter question!"}

        # B5: Response
        final_answer = get_natural_response(request.question, sql_result, user_prefs)

        return {
            "answer": final_answer,
            "debug_info": {
                "sql": current_sql
            }
        }

    except Exception as e:
        print(f"🔥 Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
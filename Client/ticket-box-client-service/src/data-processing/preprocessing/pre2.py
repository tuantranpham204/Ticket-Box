import json
import os
import re
from xhtml2pdf import pisa

JSON_FILE_GOC = 'data_tach_address.json'
JSON_FILE_MOI = 'data_tach_success.json'
PDF_FILE_MOI = 'su_kien_descriptions.pdf'


# --- cut city from address ---
def tach_thanh_pho(address_str):
    if not address_str or not isinstance(address_str, str):
        return None
    parts = address_str.rsplit(',', 1)
    if len(parts) == 2:
        return parts[1].strip()
    else:
        return None


# --- Filter HTML to fix bug PDF ---
def clean_html_for_pdf(html_str):
    if not html_str:
        return ""
    html_str = re.sub(r'\s*style="[^"]*"', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'\s*width="[^"]*"', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'\s*height="[^"]*"', '', html_str, flags=re.IGNORECASE)
    return html_str

# --- Create PDF from HTML ---
def create_pdf(html_content, pdf_filename):
    print(f"Bắt đầu tạo file PDF: '{pdf_filename}'...")
    try:
        with open(pdf_filename, "w+b") as result_file:
            pisa_status = pisa.CreatePDF(
                html_content.encode('utf-8'),
                dest=result_file,
                encoding='utf-8'
            )

        if not pisa_status.err:
            print(f"Tạo PDF thành công!")
        else:
            print(f"LỖI khi tạo PDF: {pisa_status.err}")

    except Exception as e:
        print(f"LỖI nghiêm trọng khi ghi file PDF: {e}")


if not os.path.exists(JSON_FILE_GOC):
    print(f"LỖI: Không tìm thấy file '{JSON_FILE_GOC}'!")
    exit()

print(f"Đang đọc file '{JSON_FILE_GOC}'...")
with open(JSON_FILE_GOC, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Bắt đầu xử lý JSON và trích xuất nội dung PDF...")

data_da_sua = []
html_cho_pdf = """
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Tải font Arimo (hỗ trợ đầy đủ tiếng Việt) */
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&display=swap');

        body { 
            font-family: 'Arimo', sans-serif; /* Sử dụng font Arimo */
            line-height: 1.4;
            padding: 20px;
        }
        h1 { 
            text-align: center; 
            border-bottom: 2px solid black; 
            padding-bottom: 10px;
        }
        h2 { 
            color: #333; 
            background-color: #f4f4f4; 
            padding: 10px;
            border-left: 5px solid #007bff;
        }
        .event-description { 
            margin-bottom: 20px; 
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            /* Cho phép từ dài tự động xuống hàng */
            word-wrap: break-word; 
        }
        /* Phân trang cho PDF */
        @page {
            size: a4;
            margin: 1.5cm;
        }
    </style>
</head>
<body>
<h1>TỔNG HỢP MÔ TẢ SỰ KIỆN</h1>
"""

count_json = 0
count_pdf = 0

if isinstance(data, list):
    for event_wrapper in data:
        if 'result' in event_wrapper and isinstance(event_wrapper['result'], dict):

            original_result = event_wrapper['result']
            new_result = {}

            # --- Process PDF ---
            event_title = original_result.get('title', 'Không có tiêu đề')
            event_desc = original_result.get('description', '<p>Không có mô tả.</p>')

            clean_desc = clean_html_for_pdf(event_desc)

            html_cho_pdf += f"<h2>{event_title}</h2>"
            html_cho_pdf += f"<div class='event-description'>{clean_desc}</div>"
            html_cho_pdf += "<hr>"
            count_pdf += 1

            # --- Process JSON ---
            found_address = False
            for key, value in original_result.items():

                if key == 'address':
                    address_str = value
                    new_result['detail_address'] = address_str
                    new_result['city'] = tach_thanh_pho(address_str)
                    found_address = True

                elif key == 'locationId':
                    pass

                # -- delete description from JSON ---
                elif key == 'description':
                    pass
                # -----------------------------------------------

                else:
                    new_result[key] = value

            if found_address:
                count_json += 1

            event_wrapper['result'] = new_result
        data_da_sua.append(event_wrapper)
else:
    print("Lỗi: File JSON gốc không phải là một danh sách (list).")
    exit()

print(f"\n--- XỬ LÝ JSON ---")
print(f"Đã xử lý (thay thế address, xóa locationId, xóa description) cho {count_json} sự kiện.")

if count_json > 0:
    try:
        with open(JSON_FILE_MOI, 'w', encoding='utf-8') as f:
            json.dump(data_da_sua, f, ensure_ascii=False, indent=4)
        print(f"Đã lưu file JSON đã xử lý vào: '{JSON_FILE_MOI}'")
    except Exception as e:
        print(f"\nLỖI khi lưu file JSON mới: {e}")
else:
    print("Không có sự kiện nào được xử lý, không tạo file JSON mới.")

print(f"\n--- XỬ LÝ PDF ---")
print(f"Đã trích xuất {count_pdf} sự kiện để tạo PDF.")
if count_pdf > 0:
    html_cho_pdf += "</body></html>"
    create_pdf(html_cho_pdf, PDF_FILE_MOI)
else:
    print("Không có sự kiện nào để tạo PDF.")

print("\n--- HOÀN THÀNH TẤT CẢ ---")
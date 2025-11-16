import json

file_json_cu = 'data_goc.json'
file_json_moi = 'description_only.json'
truong_can_cat = 'description'
# ------------------------------------

try:
    # 1. Đọc file JSON cũ
    with open(file_json_cu, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 2. Kiểm tra xem file cũ có phải là một đối tượng (dictionary)
    if isinstance(data, dict) and truong_can_cat in data:
        # 3. cut 'description'
        noi_dung_description = data[truong_can_cat]

        # 4. Ghi nội dung đó vào file JSON mới
        with open(file_json_moi, 'w', encoding='utf-8') as f_moi:
            json.dump(noi_dung_description, f_moi, ensure_ascii=False, indent=4)

        print(f"Đã trích xuất thành công trường '{truong_can_cat}' vào file '{file_json_moi}'")

    elif isinstance(data, dict):
        print(f"Lỗi: Không tìm thấy trường '{truong_can_cat}' trong file '{file_json_cu}'.")
    else:
        print(f"Lỗi: Nội dung trong '{file_json_cu}' không phải là một đối tượng JSON (dictionary).")

except FileNotFoundError:
    print(f"Lỗi: Không tìm thấy file '{file_json_cu}'.")
except json.JSONDecodeError:
    print(f"Lỗi: File '{file_json_cu}' không phải là file JSON hợp lệ.")
except Exception as e:
    print(f"Đã xảy ra lỗi không xác định: {e}")
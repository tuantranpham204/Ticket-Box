import requests
import time
import json

LIST_API_URL = "https://api-v2.ticketbox.vn/gin/api/v2/discovery/categories"
DETAIL_API_BASE_URL = "https://api-v2.ticketbox.vn/gin/api/v1/events/"

HEADERS = {
    'User-Agent': 'PostmanRuntime/7.50.0',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
}

# Store ID, detail
all_event_ids = set()
all_event_details = []

print("--- GIAI ĐOẠN 1: Bắt đầu lấy danh sách ID sự kiện ---")

try:
    response = requests.get(LIST_API_URL, headers=HEADERS)
    response.raise_for_status()

    list_data = response.json()
    data_result = list_data.get('data', {}).get('result', {})


    def collect_ids_from(events_list):
        if events_list and isinstance(events_list, list):
            for event in events_list:
                event_id = event.get('id')
                if event_id and isinstance(event_id, int):
                    all_event_ids.add(event_id)


    collect_ids_from(data_result.get('specialEvents', {}).get('events', []))
    collect_ids_from(data_result.get('onlyOnTicketbox', {}).get('events', []))
    collect_ids_from(data_result.get('trendingEvents', {}).get('events', []))

    big_cates = data_result.get('bigCates', [])
    if big_cates:
        for category in big_cates:
            collect_ids_from(category.get('events', []))

    print(f"Đã thu thập được {len(all_event_ids)} ID sự kiện (không trùng lặp).")

except requests.RequestException as e:
    print(f"LỖI khi gọi API danh sách: {e}")
    exit()

if not all_event_ids:
    print("Không tìm thấy ID sự kiện nào. Dừng chương trình.")
    exit()

print(f"\n--- GIAI ĐOẠN 2: Bắt đầu lấy chi tiết cho {len(all_event_ids)} sự kiện ---")

count = 0
for event_id in all_event_ids:
    count += 1
    detail_url = f"{DETAIL_API_BASE_URL}{event_id}"

    print(f"Đang lấy chi tiết sự kiện {count}/{len(all_event_ids)} (ID: {event_id})...")

    try:
        response = requests.get(detail_url, headers=HEADERS)
        response.raise_for_status()
        event_detail = response.json()
        if event_detail.get('status') == 1:
            all_event_details.append(event_detail.get('data', {}))
        else:
            print(f"  -> Bỏ qua ID {event_id}, API trả về thông báo lỗi: {event_detail.get('message')}")
        time.sleep(1)

    except requests.RequestException as e:
        print(f"  -> LỖI khi lấy ID {event_id}: {e}")
        time.sleep(1)

print("\n--- HOÀN THÀNH ---")
print(f"Đã lấy thành công chi tiết của {len(all_event_details)} sự kiện.")

#Save
try:
    with open('ticketbox_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_event_details, f, ensure_ascii=False, indent=4)
    print("Đã lưu tất cả dữ liệu vào file 'ticketbox_data.json'")
except Exception as e:
    print(f"Lỗi khi lưu file: {e}")
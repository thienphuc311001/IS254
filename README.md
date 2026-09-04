# Kính Lúp Kim Cương — Decision Support System

Hệ thống hỗ trợ ra quyết định chọn mua kim cương, chạy hoàn toàn phía client (không cần backend).

## Cách chạy

### Cách 1: Mở trực tiếp (nhanh nhất)

1. Mở thư mục dự án.
2. Nhấp đúp vào `index.html` (hoặc kéo thả vào trình duyệt Chrome/Edge/Firefox).

App sẽ tự đọc dữ liệu từ `data_ready.xlsx` ngay khi mở trang.

> Lưu ý: một số trình duyệt chặn `fetch()` qua giao thức `file://`. Nếu trang hiển thị "Không đọc được data_ready.xlsx", hãy dùng cách 2.

### Cách 2: Chạy local server (khuyến nghị)

Cần có Python 3 hoặc Node.js.

Với Python:

```bash
cd thu-muc-du-an
python3 -m http.server 8765
```

Với Node.js:

```bash
npx serve .
```

Sau đó mở trình duyệt tại địa chỉ mà terminal in ra, ví dụ `http://localhost:8765`.

## Cấu trúc file

| File                | Vai trò                                                             |
| ------------------- | -------------------------------------------------------------------- |
| `index.html`      | Giao diện chính, chỉ chứa markup                                 |
| `style.css`       | Toàn bộ style                                                      |
| `app.js`          | Logic UI và thuật toán`compute()` 3 bước                      |
| `xlsx-loader.js`  | Đọc`data_ready.xlsx` lúc chạy bằng JSZip + XML parsing        |
| `jszip.min.js`    | Thư viện giải nén file`.xlsx`                                  |
| `data_ready.xlsx` | Dữ liệu đầu vào (sheet`data_ready`, 763 viên sau làm sạch) |
| `data_clean.xlsx` | Dữ liệu thô gốc (tham khảo)                                     |

## Cập nhật dữ liệu

Chỉ cần thay thế `data_ready.xlsx` bằng file mới (giữ nguyên cấu trúc cột) rồi tải lại trang. Không cần build lại gì cả.

## Thuật toán

1. **Hard Filter** — loại viên vượt ngân sách, nhỏ hơn carat tối thiểu, hoặc không đạt chuẩn màu / độ trong.
2. **Weighted Scoring Model** — chuẩn hóa 4 tiêu chí về `[0, 1]` rồi tính điểm tổng hợp theo trọng số người dùng nhập.
3. **Rule-based Override** — sau khi WSM xếp hạng, hệ thống áp dụng 4 quy tắc nghiệp vụ R1–R4 (ưu tiên LGD khi không còn phương án Tự nhiên, nhãn "giá cao", ưu tiên GIA ở phân khúc cao cấp, điều chỉnh theo mục đích) để kết quả phù hợp hơn với yêu cầu sử dụng.

## 5 use cases demo

> Mỗi expected value bên dưới đã được xác minh bằng chính engine `compute()` 3 bước chạy trên `data_ready.xlsx` (763 viên · 645 Tự nhiên · 118 LGD) và unit test trong `test/engine.test.js`.

### UC1 · Ngân sách hạn chế, cần ≥ 1 ct — R1
- Input: preset `Nhẫn cưới`; Budget `25.000.000 đ`; Carat `≥ 1.00`; màu `D–J`; độ trong `FL–SI2`.
- Expected: cờ `[R1]` (level override): *"…không có kim cương Tự nhiên nào thỏa mãn — hệ thống ghi đè gợi ý sang LGD"*; Top 5 toàn LGD, dẫn đầu `1.73ct E/VS1 · 6.500.000 đ`.
- Talking point: R1 quét toàn bộ dữ liệu (mọi viên Tự nhiên có chứng nhận), không chỉ Top 8 — trong 645 viên Tự nhiên không có viên ≥ 1 ct dưới 30 triệu nên WSM bị ghi đè hợp lý.

### UC2 · Nhẫn cưới cần màu sáng — R4 (Cưới) + R3
- Input: preset `Nhẫn cưới` (Size 3 / Finance 2 / Quality 4 / Env 1); Budget `120.000.000 đ`; Carat `≥ 1.20`; màu `D–J`; độ trong `FL–VS2`.
- Expected: WSM tạm cho `1.23ct J/VVS2 GIA · 82.800.000 đ` đứng Top 1, nhưng cờ `[R4]` đổi chỗ cho viên màu sáng hơn: Top 1 = `1.22ct H/VS2 GIA · 108.000.000 đ`; đồng thời cờ `[R3]` bật (budget ≥ 100 triệu) và Top 5 chỉ còn GIA.
- Talking point: nhẫn cưới cần hiệu ứng sáng, không chỉ tối đa carat; rule giải thích rõ vì sao Top 1 bị thay.

### UC3 · Tích trữ / đầu tư — R3
- Input: preset `Tích trữ` (Size 2 / Finance 5 / Quality 3 / Env 1); Budget `150.000.000 đ`; Carat `≥ 0.50`; màu `D–F`; độ trong `FL–VS2`.
- Expected: cờ `[R3]` (info): *"Phân khúc trên 100 triệu — hệ thống ưu tiên chứng nhận GIA"*; Top 5 = 5/5 Tự nhiên GIA, dẫn đầu `0.50ct D/VS1 GIA · 29.900.000 đ` (score ≈ 0.74).
- Talking point: ngưỡng R3 thật là ≥ 100 triệu (`RULES.R3_PREMIUM_GIA`); khi còn Natural GIA trong Top 8, mọi viên không GIA — kể cả LGD — bị loại khỏi Top.

### UC4 · Phân khúc siêu cao cấp — R2 (nhãn "giá cao")
- Input: preset `Nhẫn cưới`; Budget `800.000.000 đ`; Carat `≥ 2.00`; màu `D–F`; độ trong `FL–VS2`.
- Expected: các dòng vượt giá/carat mang nhãn "giá cao" (tooltip R2) — ví dụ `2.01ct D/VS1 GIA · 678.000.000 đ` (≈ 337 tr/ct > ngưỡng 150 tr/ct Tự nhiên); Top 5 chỉ có 2 viên, cả 2 đều dán nhãn; cờ `[R3]` bật.
- Talking point: R2 không loại viên mà gắn nhãn cảnh báo premium; LGD có ngưỡng riêng thấp hơn (30 tr/ct).

### UC5 · Ưu tiên môi trường — Eco blend (điều kiện R4 Môi trường)
- Input: preset `Quà tặng / Cá nhân`; Budget `120.000.000 đ`; màu `D–F`; độ trong `FL–VS2`. Chạy 2 lần: (a) mặc định, (b) bật `Ưu tiên thân thiện môi trường`.
- Expected: (a) Top 5 toàn Tự nhiên GIA + cờ `[R3]`; (b) trọng số môi trường tăng 0.182 → 0.291 (blend 60/40 với vector eco `[0.18, 0.18, 0.18, 0.45]`), Top 5 đảo sang toàn LGD (dẫn đầu `1.73ct E/VS1 · 6.500.000 đ`) và `[R3]` tắt vì Top 8 không còn Natural GIA.
- Talking point trung thực: banner ghi đè `[R4]` chỉ bật khi LGD dẫn đầu và Natural gần nhất chênh ≤ 0.10 trên cả 3 tiêu chí size/finance/quality; trên `data_ready.xlsx` khoảng cách tối thiểu ≈ 1.0 nên banner không kích hoạt với dữ liệu thật — điều kiện này được xác minh bằng unit test dữ liệu giả lập (`test/engine.test.js`).

> Demo tip: chạy lần lượt UC1 → UC5 theo thứ tự trên, chụp lại Top 5 + các cờ `[R…]` sau mỗi bước; UC5 nhớ chụp cả 2 trạng thái của nút "Ưu tiên thân thiện môi trường".

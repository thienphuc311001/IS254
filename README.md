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

### UC1 · Ngân sách hạn chế, cần ≥ 1 ct — R1
- Input: Budget `25.000.000 đ`, Carat `≥1.00`, màu `D–J`, độ trong `FL–SI2`, preset `Nhẫn cưới`.
- Expected: Top 5 toàn LGD; cờ `override` R1 bật.
- Talking point: WSM chọn size/giá trị tốt nhất, còn R1 giải thích vì sao Natural không khả thi ở ràng buộc này.

### UC2 · Nhẫn cưới sáng và đủ lớn — R4 (Cưới) + quality-first preset
- Input: Budget `80.000.000 đ`, Carat `≥0.70`, màu `D–F`, độ trong `FL–VS2`, preset `Nhẫn cưới` (`Size 3 / Finance 2 / Quality 4 / Environment 1`).
- Expected: nếu ứng viên đầu có màu ≤ J, hệ thống ưu tiên viên ≥ I và thêm flag `R4`.
- Talking point: nhẫn cưới cần hiệu ứng sáng, không chỉ tối đa carat.

### UC3 · Tích trữ/đầu tư — R3
- Input: Budget `≥150.000.000 đ`, Carat `≥0.50`, preset `Tích trữ`.
- Expected: khi có Natural GIA trong shortlist, R3 chỉ giữ GIA.
- Talking point: ưu tiên giữ giá ~90%, tính thanh khoản và chuẩn phân khúc cao cấp.

### UC4 · Ưu tiên môi trường — Eco blend + R4 (Môi trường)
- Input: Budget `120.000.000 đ`, preset `Quà tặng / Cá nhân`; tăng `Environment` lên 3 rồi bật `Ưu tiên thân thiện môi trường`.
- Expected: trọng số environment tăng nhưng thứ hạng chỉ đổi theo eco-blend; nếu LGD dẫn đầu và Natural gần tương đương (max criterion gap ≤ `0.10`), hiện banner R4.
- Talking point: R4 giải thích lựa chọn thân thiện môi trường thay vì ghi đè kết quả sau rule.

### UC5 · Phân khúc cao cấp — R3 bảo vệ chuẩn GIA
- Input: Budget `300.000.000 đ`, Carat `≥0.70`, preset `Nhẫn cưới`, giữ bộ lọc chất lượng mặc định.
- Expected: danh sách ngắn chỉ còn Natural GIA khi có ít nhất một Natural GIA trong Top 8; các mục không GIA bị loại và flag `R3` xuất hiện.
- Talking point: ngân sách premium yêu cầu chuẩn kiểm định mạnh hơn, kể cả khi LGD cho carat lớn hơn.

> Demo tip: đặt từng bộ input theo thứ tự trên và chụp lại Top 5 + flags; các expected value được xác minh bằng engine hiện tại trên `data_ready.xlsx`.

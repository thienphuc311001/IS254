# Báo cáo dự án — Kính Lúp Kim Cương

Môn học: Hệ hỗ trợ ra quyết định (Decision Support System)

## 1. Tổng quan

Xây dựng ứng dụng DSS giúp người dùng chọn mua kim cương phù hợp với ngân sách và tiêu chí cá nhân.

## 2. Dữ liệu

| File                | Mô tả                                                    |
| ------------------- | ---------------------------------------------------------- |
| `data_clean.xlsx` | Dữ liệu thô gốc: 785 dòng × 14 cột                  |
| `data_ready.xlsx` | Dữ liệu đã làm sạch + mã hóa: 763 dòng × 17 cột |

Quy trình làm sạch từ `data_clean.xlsx` → `data_ready.xlsx`:

1. Xóa trùng lặp (bỏ STT 93): 785 → 784 dòng.
2. Loại fancy color và dòng thiếu Color: 784 → 763 dòng.

Kết quả cuối: **645 viên Tự nhiên + 118 viên LGD**, từ 5 cửa hàng (`tierra.vn`, `jemmia.vn`, `mayadiamond.vn`, `thaolinhjewelry.vn`, `trangsuc.doji.vn`).

Các cột mã hóa trong `data_ready.xlsx`:

| Cột             | Thang mã                                 |
| ---------------- | ----------------------------------------- |
| `color_code`   | N=0 … D=10 (càng trắng càng cao)      |
| `clarity_code` | SI2=1 … FL=8 (càng sạch càng cao)     |
| `cut_code`     | Very Good/thiếu = 2, Excellent = 3       |
| `cert_code`    | Không rõ = 0, DJL = 1, IGI = 2, GIA = 3 |
| `is_natural`   | 0 = LGD, 1 = Natural                      |

Đặc điểm dữ liệu đáng chú ý:

- Toàn bộ 118 viên LGD có chứng nhận "Không rõ" (không có GIA/IGI/DJL).
- 126/763 viên thiếu giá trị `cut_raw`.
- Giá dao động từ 2.808.000 đ (LGD Round 0.36ct) đến 1.126.391.200 đ (Natural Round 2.4ct GIA).
- Tỷ lệ giữ giá: Natural = 90%, LGD = 60%.

## 3. Kiến trúc app

App được tách thành các file riêng biệt, không nhúng CSS hoặc script trong HTML:

| File                | Vai trò                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `index.html`      | Markup thuần (176 dòng), chỉ chứa`<link>` và `<script src>`                                       |
| `style.css`       | Toàn bộ giao diện (~230 dòng)                                                                          |
| `app.js`          | Logic UI, WSM scoring, rule engine (~300 dòng)                                                            |
| `xlsx-loader.js`  | Đọc`.xlsx` lúc chạy: giải nén bằng JSZip → parse XML → gán biến `DATA`, `META` toàn cục |
| `jszip.min.js`    | Thư viện giải nén zip (JSZip v3.10.1)                                                                  |
| `data_ready.xlsx` | Nguồn dữ liệu duy nhất — thay file này là app dùng dữ liệu mới ngay                             |

## 4. Thuật toán compute() — mô hình 3 bước

### Bước 1 · Hard Filter (lọc cứng)

Loại bỏ viên không đạt điều kiện tối thiểu:

- Giá > ngân sách → loại.
- Carat < carat tối thiểu → loại.
- Màu < màu tối thiểu yêu cầu → loại.
- Độ trong < độ trong tối thiểu → loại.
- Viên có dữ liệu bất thường (giá = 0, carat > 6ct, giá > 2 tỷ) → loại (sanity check — lọc dữ liệu, không phải rule override).

### Bước 2 · Weighted Scoring Model (WSM)

Tính điểm tổng hợp trên tập ứng viên sau lọc:

**Score = w₁·Size + w₂·Finance + w₃·Quality + w₄·Environment**

Trong đó mỗi tiêu chí được chuẩn hóa về [0, 1] bằng min-max normalization trên chính tập ứng viên:

| Tiêu chí  | Công thức giá trị thô       | Ý nghĩa                                                     |
| ----------- | -------------------------------- | ------------------------------------------------------------- |
| Size        | `carat / (price/1e6)`          | Carat trên mỗi triệu đồng — càng cao càng "rẻ"       |
| Finance     | `price × resale_rate`         | Giá trị thu hồi ước tính khi bán lại                  |
| Quality     | `(cut_score + cert_score) / 2` | Trung bình của giác cắt và chứng nhận                  |
| Environment | LGD = 0.85, Natural = 0.15       | LGD tránh khai mỏ; carbon không tính vì còn tranh luận |

Trọng số w₁–w₄ do người dùng nhập qua slider (0–5★), chuẩn hóa để tổng = 1. Có 4 preset sẵn: Cưới (4,2,3,1), Tích lũy (2,5,3,1), Cân bằng (3,3,3,2), Môi trường (2,2,2,5).

Với viên thiếu `cut_raw`: gán `cut_score = 0.85` (tương đương Very Good) — không loại khỏi kết quả.

### Bước 3 · Rule-based Override (4 quy tắc R1–R4)

Sau khi WSM xếp hạng, hệ thống áp dụng 4 quy tắc nghiệp vụ đơn giản để xử lý các trường hợp mà điểm số thuần túy chưa phản ánh đầy đủ mục đích sử dụng. Các quy tắc không thay thế WSM mà chỉ đóng vai trò override có điều kiện:

| Rule          | Điều kiện                                                                   | Hành động                                        |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| **R1**  | Không có Natural có chứng nhận đáp ứng ngân sách và carat tối thiểu | Ghi đè: ưu tiên LGD và hiển thị cảnh báo |
| **R2**  | Giá mỗi carat vượt ngưỡng tham chiếu (Natural > 150tr/ct, LGD > 30tr/ct) | Nhãn "giá cao" trên dòng kết quả |
| **R3**  | Ngân sách ≥ 100 triệu và có Natural GIA phù hợp                      | Lọc Top chỉ giữ nhóm Natural GIA      |
| **R4**  | Theo mục đích: **Môi trường** — Natural và LGD có điểm WSM gần nhau (chênh ≤ 0.10); **Cưới** — Top 1 có màu quá thấp (≤ J) | Môi trường: ưu tiên LGD + banner; Cưới: ưu tiên viên sáng hơn (≥ I) lên Top 1 |

Các cờ hiển thị trên UI với 3 mức màu:

- 🔴 Đỏ (override): R1, R4 (Môi trường) — hệ thống chủ động sắp xếp lại Top.
- 🟢 Xanh ngọc (info): R3, R4 (Cưới) — ghi chú điều chỉnh nhẹ.
- Nhãn nhỏ trên từng dòng kết quả: "giá cao" (R2).

## 5. Những gì đã thực hiện theo trình tự

### Giai đoạn 1 · Khảo sát và thiết kế

- Khảo sát `index.html` prototype có sẵn (nhúng cứng 785 dòng thô), `data_clean.xlsx` (785×14), `data_ready.xlsx` (763×17 + cleaning_report).
- Xác nhận bảng mã hóa color/clarity/cut/cert khớp giữa code và Excel.
- Chốt 3 quyết định: dùng data_ready 763 dòng, tách dữ liệu thành file riêng, giữ chiều env score (LGD > Natural).

### Giai đoạn 2 · Nạp dữ liệu động từ Excel

- Ban đầu tách DATA thành `data.js` tĩnh sinh bởi `build_data.py`. Sau đó nâng cấp thành nạp động hoàn toàn từ xlsx.
- Copy `jszip.min.js` từ runtime vào dự án (không tải mạng).
- Viết `xlsx-loader.js`: fetch file xlsx → JSZip giải nén → parse `sharedStrings.xml`, `workbook.xml` (tìm sheet tên "data_ready"), `sheetN.xml` → gán `DATA` và `META`.
- Sửa lỗi header inlineStr (openpyxl ghi header dạng inline string, không phải sharedString) — ban đầu loader trả 0 dòng vì không xử lý đúng loại cell này.
- Xóa `data.js` và `build_data.py` sau khi chuyển hẳn sang nạp động.

### Giai đoạn 3 · Tách CSS và JS khỏi HTML

- Trích 226 dòng CSS → `style.css`.
- Trích ~230 dòng inline script → `app.js`.
- Dọn `index.html` còn 176 dòng markup sạch, sửa trùng lặp thẻ meta.
- Kiểm tra: 0 thẻ `<style>`, 0 script inline, đúng 3 thẻ `<script src>`.

### Giai đoạn 4 · Phát triển bộ quy tắc chuyên gia

- Đề xuất 10 rule R1–R10 kèm bằng chứng thống kê từ data.
- Người dùng phản hồi chi tiết từng rule: đồng ý 8, sửa ngưỡng R2 (15tr→10tr), phát hiện lỗi nghiêm trọng R4 (toàn bộ LGD cert = "Không rõ" sẽ bị loại hết nếu giữ nguyên), đề xuất thêm R11.
- Chốt phương án R4: cảnh báo thay vì loại bỏ.
- Triển khai rule engine đầy đủ trong `app.js`, tích hợp hiển thị flags đa màu trên banner + badge nhỏ trên từng dòng bảng.
- Kiểm thử với data thật: tất cả PASS.
- Hợp nhất final: rút gọn còn đúng 4 quy tắc chính R1–R4 (sanity check đưa về lọc dữ liệu ở Bước 1, bỏ các cảnh báo/nhãn phụ không thuộc 4 quy tắc).

### Giai đoạn 5 · Kiểm thử

Sử dụng headless DOM stub (Node.js VM context) thay cho browser thật vì sandbox chặn Chromium:

| Test                    | Mô tả                                                    | Kết quả |
| ----------------------- | ---------------------------------------------------------- | --------- |
| Nạp dữ liệu động   | DATA.length === 763, META khớp cleaning_report            | PASS      |
| Hard Filter mặc định | filtered = 200 viên (budget 60tr, ≥0.5ct, D-F, FL-VS2)   | PASS      |
| WSM chuẩn hóa         | Tất cả sub-score ∈ [0,1], sắp xếp giảm dần          | PASS      |
| R1 Override             | Budget 25tr & ≥1ct → override=true, top1 là LGD         | PASS      |
| R2 Price-per-carat      | Viên vượt ngưỡng 150tr/ct (Natural) / 30tr/ct (LGD) → nhãn "giá cao" | PASS |
| R3 Premium GIA          | Budget ≥100tr → Top chỉ còn Natural GIA                | PASS      |
| R4 Môi trường           | Eco bật + LGD dẫn đầu + chênh WSM ≤ 0.10 → override LGD | PASS      |
| R4 Cưới                 | Top 1 màu ≤ J → đưa viên sáng hơn (≥ I) lên Top 1      | PASS      |
| Sanity filter           | Không loại nhầm viên hợp lệ (filtered vẫn 200)      | PASS      |
| Sau tách file          | CSS/script tách xong, runtime hoạt động bình thường | PASS      |

## 6. Hướng chạy app

Chi tiết xem [README.md](README.md). Tóm tắt:

- Mở trực tiếp `index.html` trong trình duyệt, hoặc
- Chạy `python3 -m http.server 8765` rồi mở `http://localhost:8765`.

## 7. Hạn chế hiện tại và hướng phát triển

**Hạn chế:**

- 118 viên LGD đều thiếu chứng nhận — không thể xác minh chất lượng thực, chỉ có thể cảnh báo.
- 126 viên thiếu cut_raw, phải gán điểm trung tính — giảm độ chính xác tiêu chí Quality cho nhóm này.
- Giá và thông tin sản phẩm lấy từ web cửa hàng tại một thời điểm, chưa có cơ chế cập nhật tự động.

**Hướng phát triển:**

- Bổ sung chứng nhận IGI Lab-Grown Report cho LGD (cải thiện R4 từ cảnh báo → lọc mạnh hơn).
- Thêm tính năng so sánh 2 viên cạnh nhau (A/B comparison).
- Lưu lịch sử tìm kiếm người dùng vào localStorage.
- Xuất kết quả Top 5 ra PDF hoặc ảnh chia sẻ.

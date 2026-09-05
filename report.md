# Report 2 — DSS Engine: Quality, Finance, Preset & Purpose

## Trạng thái

Đã triển khai chính theo kế hoạch đã chốt. Sau kỳ hợp nhất final, hệ thống dùng đúng **4 quy tắc override R1–R4** (xem `report.md` — Bước 3); sanity check được đưa về lọc dữ liệu ở Bước 1. Bộ test hiện chạy **11/11 pass**.

## Thuật toán — 3 bước chính

Engine chấm điểm trong `compute()` (`app.js`) chạy theo ba bước, trong đó **WSM vẫn là hạng chính** và các rule ở Bước 3 chỉ override có điều kiện:

### Bước 1 · Hard Filter — lọc cứng

Loại ngay các viên không đạt điều kiện đầu vào trước khi chấm điểm:

- `price > budget` hoặc `carat < minCarat` → loại.
- `colorCode < minColorCode` hoặc `clarityCode < minClarityCode` → loại.
- Sanity check (lọc dữ liệu bất thường, không phải rule override): `price === 0`, `carat > 6`, hoặc `price > 2 tỷ` (`RULES.SANITY_FILTER`) → loại.

### Bước 2 · Weighted Scoring Model (WSM) — chấm điểm và xếp hạng

- Chuẩn hóa min–max từng tiêu chí về `[0,1]` trên tập ứng viên sau lọc (dùng toàn bộ dữ liệu nếu tập lọc rỗng):
  - `Size` = `carat / (price/1e6)` (carat trên mỗi triệu VND).
  - `Finance` = `resale_rate` (tỷ lệ giữ giá, độc lập giá bán).
  - `Quality` = `(norm(cut) + norm(cert)) / 2`.
  - `Environment` = `0.85` (LGD) / `0.15` (Natural).
- Trọng số lấy từ preset mục đích (Bước 1 UI), trộn eco-blend `0.6/0.4` nếu bật "Ưu tiên thân thiện môi trường".
- Điểm tổng: `Score = w1·Size + w2·Finance + w3·Quality + w4·Environment`, sắp xếp giảm dần và lấy **Top 8** (nhiều hơn 5 để các rule ở Bước 3 còn dư địa).

### Bước 3 · Rule-Based Override — 4 quy tắc R1–R4

Các quy tắc chuyên gia chỉ can thiệp có điều kiện lên Top 8; mỗi rule khi kích hoạt sẽ gắn cờ hiển thị trên UI:

| Rule | Tên | Điều kiện kích hoạt | Hành động |
| ---- | --- | ------------------- | --------- |
| **R1** | Không có Natural phù hợp | Trong ngân sách + carat đã chọn, **không tồn tại** viên Natural nào có chứng nhận (`certCode > 0`) | Ghi đè thứ hạng: đẩy toàn bộ LGD lên trước Natural trong Top kết quả (cờ `override`) |
| **R2** | Nhãn "giá cao" | Giá trên mỗi carat vượt ngưỡng tham chiếu: Natural > **150 triệu/ct**, LGD > **30 triệu/ct** (`R2_HIGH_PRICE_PER_CT`) | Gắn nhãn `giá cao` trên dòng kết quả — chỉ cảnh báo, không đổi thứ hạng |
| **R3** | Ưu tiên GIA | Ngân sách ≥ **100 triệu** (`R3_PREMIUM_GIA.budget`) **và** còn Natural GIA (`certCode === 3`) trong Top | Lọc Top chỉ giữ lại các viên chứng nhận GIA (cờ `info`) |
| **R4** | Điều chỉnh theo mục đích | (a) **Cưới**: Top 1 có màu ≤ J và còn viên màu sáng hơn (≥ I) trong Top → hoán đổi đưa viên sáng lên Top 1. (b) **Môi trường**: bật eco, Top 1 là LGD, và Natural tốt nhất trong phần còn lại của Top có khoảng cách Chebyshev `max(ΔSize, ΔFinance, ΔQuality) ≤ 0.10` (`R4_MAX_CRITERION_GAP`) | (a) Swap Top 1. (b) Chỉ **giải thích**: bật `ecoOverride` + banner eco, không hoán đổi hay sort lại |

Sau Bước 3, engine cắt **Top 5** cuối cùng để hiển thị cùng toàn bộ cờ rule đã kích hoạt.
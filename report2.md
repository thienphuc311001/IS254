# Report 2 — DSS Engine: Quality, Finance, Preset & Purpose

## Trạng thái

Đã triển khai chính theo kế hoạch đã chốt. Sau kỳ hợp nhất final, hệ thống dùng đúng **4 quy tắc override R1–R4** (xem `report.md` — Bước 3); sanity check được đưa về lọc dữ liệu ở Bước 1. Bộ test hiện chạy **11/11 pass**.

## Đã làm

### 1. Tách cấu hình dùng chung

- Tạo mới `diamond-config.js`.
- Chuyển toàn bộ cấu hình dùng chung ra khỏi `app.js`:
  - `RULES`, gồm ngưỡng `R2_HIGH_PRICE_PER_CT`, `R3_PREMIUM_GIA`, `R4_MAX_CRITERION_GAP`, `SANITY_FILTER` (đánh số final sau khi hợp nhất còn 4 rule).
  - Bảng mã `COLOR_CODE`, `CLARITY_CODE`.
  - Bảng điểm `CUT_SCORE`, `CERT_SCORE`.
  - Enum mục đích `PURPOSE` với ba giá trị: `WEDDING`, `INVESTMENT`, `GIFT_PERSONAL`.
  - Preset trọng số tương ứng ba mục đích trên.
  - Cấu hình eco-blend: tỷ lệ `0.6 / 0.4` và vector eco `[0.18, 0.18, 0.18, 0.45]`.
- Chuyển hàm dùng chung sang file này:
  - `normalizeWeights(weights)`.
  - `applyEcoBlend(baseWeights, ecoPreferred)`.
- Cập nhật `index.html` để nạp `diamond-config.js` trước `app.js`.

### 2. Công thức Quality

- `cut_code` và `cert_score` được chuẩn hóa riêng biệt về `[0,1]` trên tập ứng viên trước khi trung bình.
- Công thức hiệu lực trong `compute()`:

```js
Quality = (norm(cut) + norm(cert)) / 2
```

- Điều này giữ cho yếu tố cắt vẫn có ý nghĩa thực chất khi trộn dữ liệu Natural và LGD có chứng nhận lệch nhau.

### 3. Công thức Finance

- Finance đã đổi thành chỉ phụ thuộc khả năng giữ giá:

```js
Finance = norm(resale_rate)
```

- Đã loại bỏ ảnh hưởng trực tiếp của `price` vào điểm Finance.
- Hai viên cùng `resale_rate` nhưng giá khác nhau sẽ nhận cùng điểm Finance sau chuẩn hóa.

### 4. Rule R2 (cũ — đã hợp nhất)

- Ngưỡng cảnh báo ngân sách không thực tế (dưới 10 triệu VND và carat ≥ 2.00 ct) từng được triển khai kèm unit test.
- Sau kỳ hợp nhất final, cảnh báo này bị **loại bỏ**; tên `R2` hiện được dùng cho quy tắc **nhãn "giá cao"** theo giá trên mỗi carat (`R2_HIGH_PRICE_PER_CT`: Natural > 150tr/ct, LGD > 30tr/ct).

### 5. Rule R4 cũ (nhãn "chưa xác minh" — đã hợp nhất)

- LGD hoặc viên có `certCode === 0` không bị loại khỏi Top kết quả (hành vi lọc vẫn giữ nguyên ở engine).
- Nhãn `flagUnverifiedCert` / "chưa xác minh" trên UI đã bị **loại bỏ** trong kỳ hợp nhất; `R4` hiện là quy tắc điều chỉnh theo mục đích (Môi trường / Cưới).

### 6. Eco blend

- Thêm cơ chế trộn trọng số khi người dùng bật “Ưu tiên thân thiện môi trường”.
- Công thức:

```text
w_final = 0.6 * w_base + 0.4 * w_eco
```

- Vector eco sau chuẩn hóa nội bộ:

```text
[0.18, 0.18, 0.18, 0.45]
```

- Eco-blend ảnh hưởng đến điểm WSM và thứ hạng ở Bước 2.
- Checkbox eco không thay đổi trực tiếp giá trị slider; slider vẫn hiển thị lựa chọn gốc của người dùng.

### 7. Rule R9 → R4 (Môi trường)

- Loại bỏ hành vi cũ ép LGD lên Top 1.
- Xóa epsilon tạm `1.045e-4`.
- Đổi cách đo độ tương đương sang khoảng cách Chebyshev trên ba tiêu chí đã chuẩn hóa, **không bao gồm Environment**:
  - Size.
  - Finance.
  - Quality.
- Ngưỡng mới (đổi tên theo đánh số final):

```js
R4_MAX_CRITERION_GAP = 0.10
```

- Logic R4 (Môi trường) mới:
  1. Lấy Top 8 sau eco-blend.
  2. Nếu Top 1 không phải LGD thì không kích hoạt R4.
  3. Lọc riêng các ứng viên Natural từ phần còn lại của Top 8; không so LGD khác với Top 1.
  4. Nếu không còn Natural nào thì không kích hoạt R4 và không gây runtime error.
  5. Với mỗi Natural, tính:

```js
gap = max(abs(Size gap), abs(Finance gap), abs(Quality gap))
```

6. Chọn Natural có gap nhỏ nhất.
7. Nếu gap nhỏ nhất `<= 0.10`, bật `ecoOverride = true`, hiển thị flag R4 và banner eco.

- R4 (Môi trường) hiện chỉ đóng vai trò **giải thích**, không hoán đổi hay sort lại danh sách kết quả.

### 8. Purpose và preset

- UI Step 1 chỉ còn ba mục đích:
  - Nhẫn cưới: `wedding`.
  - Tích trữ: `invest`.
  - Quà tặng / Cá nhân: `gift`.
- Đã xóa nút `balanced` và `eco` khỏi UI.
- Preset trọng số hiện tại:

| Purpose       | Size | Finance | Quality | Environment |
| ------------- | ---: | ------: | ------: | ----------: |
| Wedding       |    3 |       2 |       4 |           1 |
| Investment    |    2 |       5 |       3 |           1 |
| Gift personal |    3 |       3 |       3 |           2 |

### 9. Result page

- Bannereco riêng vẫn giữ nguyên nội dung:

```text
Đã ưu tiên kim cương nhân tạo vì tương đương chất lượng, thân thiện môi trường hơn.
```

- Banner chỉ hiển thị khi:

```js
ecoPreferred && ecoOverride
```

- Nhờ guard mới, banner không hiện khi Natural vẫn đứng Top 1.

## Kiểm thử

Bộ test trong `test/engine.test.js` hiện chạy **11/11 pass**:

1. Quality normalization keeps cut meaningful when certificates diverge.
2. Finance score depends on resale rate rather than price.
3. R2 flags stones priced above the reference per-carat threshold.
4. Eco blend preserves total weight and applies the configured ratio.
5. R4 explains a close LGD alternative only when it already leads with eco enabled.
6. R4 does not activate when a natural candidate leads despite eco preference.
7. R4 ignores alternatives that differ by more than the criterion gap limit.
8. R3 removes non-GIA stones when a GIA candidate is present.
9. R3 stays inactive when the premium shortlist has no GIA stone.
10. R4 handles an all-LGD shortlist without runtime errors.
11. Eco blend is hidden from slider values and exposed in compute state.

## Kết quả kiểm tra cú pháp

Các lệnh sau đã chạy:

```bash
node --check diamond-config.js
node --check app.js
node --check test/engine.test.js
```

Cả ba file đều hợp lệ về cú pháp.

## Hạn chế đã biết

- Banner R4 (Môi trường) vẫn có giới hạn thiết kế: nếu LGD vốn mạnh hơn trên ba tiêu chí phi-môi trường nhưng từng tiêu chí vẫn chênh `<= 0.10`, hệ thống vẫn mô tả ưu tiên theo môi trường cho trường hợp tổng thể tương đương.
- Không làm DB/API thật vì repo là frontend tĩnh; enum purpose chỉ chuẩn hóa ở tầng frontend nội bộ.

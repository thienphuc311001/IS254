# PLAN — Fix các vấn đề phát hiện trong DSS Engine (Rule-based Override & WSM)

> Tài liệu này tổng hợp các vấn đề phát hiện khi kiểm chứng bộ 10 rule (Rule-based Override) và công thức Weighted Sum Model (WSM) trên dữ liệu thật `data_ready.xlsx` (763 dòng: 645 Natural + 118 LGD), kèm kế hoạch sửa cụ thể.

---

## 0. Tóm tắt nhanh

| Mức độ | Số lượng | Trạng thái |
|---|---|---|
| 🔴 Chặn tiến độ (blocking) | 2 vấn đề | Phải sửa trước khi build tiếp module `compute()` |
| 🟡 Quan trọng, nên sửa trước launch | 4 vấn đề | Không chặn code nhưng ảnh hưởng chất lượng gợi ý |
| 🟢 Có thể làm song song | 4 việc | Không phụ thuộc các sửa đổi trên |

---

## 1. 🔴 Ưu tiên 1 — Blocking

### 1.1 Rule R4 loại bỏ 100% kim cương LGD khỏi Top 5

**Vấn đề:** Rule R4 quy định "loại viên có `cert_code = 0` (Không rõ) khỏi khuyến nghị chính". Kiểm tra thực tế: **100% (118/118) viên LGD trong dữ liệu đều có `cert_raw = "Không rõ"`**. Không có viên LGD nào có GIA/IGI/DJL.

→ Nếu áp rule nguyên bản, **toàn bộ LGD sẽ luôn bị loại khỏi Top 5**, mọi ngân sách, mọi mục đích — mâu thuẫn trực tiếp với **R1** (bắt buộc gợi ý LGD khi ngân sách không đủ mua Natural ≥1ct). Hai rule sẽ đánh nhau và LGD không bao giờ được đề xuất dù R1 yêu cầu.

**Việc cần làm — chọn 1 trong 2 hướng:**

- [ ] **Hướng A (sửa data):** Bổ sung chứng nhận thật cho các viên LGD (LGD thường có "IGI Lab-Grown Diamond Report"). Cần làm việc với nguồn dữ liệu / nhà cung cấp để lấy `cert_raw` chính xác thay vì "Không rõ".
- [ ] **Hướng B (sửa rule, ưu tiên nếu không lấy được data mới kịp):** Đổi hành động của R4 từ "loại khỏi Top 5" → "gắn nhãn cảnh báo (`unverified_cert: true`) trên thẻ sản phẩm, vẫn giữ trong danh sách tính điểm và xếp hạng bình thường".

**Owner:** Data team (Hướng A) / BE (Hướng B)
**Chặn:** Module `compute()` bước 3 (Rule Engine)

---

### 1.2 Công thức Quality bị "cert lấn át cut" — vô tình mã hoá lại Natural/LGD

**Vấn đề:** Công thức hiện tại:
```
Quality = (cut_score + cert_score) / 2   # cộng thô rồi mới chuẩn hoá cả cụm
```

Dữ liệu thật cho thấy 2 biến này lệch scale nghiêm trọng:

| Trường | Khoảng giá trị thực tế | Span |
|---|---|---|
| `cut_code` | 2–3 (NaN mặc định = 2) | 1 |
| `cert_code` | 0–3 | 3 |

Vì `cert_code` có biên độ gấp 3 lần `cut_code`, nó chi phối gần như toàn bộ biến thiên của Quality. Nghiêm trọng hơn: `cert_code` gần như trùng khớp hoàn toàn với origin (642/645 Natural = GIA/code 3; 118/118 LGD = Không rõ/code 0). Kết quả: **Quality vô tình chỉ đang đo "đây là Natural hay LGD"**, trùng lặp với Environment (đã tách theo origin) và một phần Finance (vì `resale_rate` cũng cố định theo origin).

→ Hệ quả: 3/4 tiêu chí (Quality, Finance, Environment) đều bị chi phối bởi biến origin, chỉ còn Size thực sự phân biệt từng viên độc lập.

**Việc cần làm:**
- [ ] Sửa công thức: chuẩn hoá `cut_score` và `cert_score` **riêng biệt** về `[0,1]` trước khi lấy trung bình:
  ```
  Quality = (norm(cut_code) + norm(cert_code)) / 2
  ```
- [ ] Viết unit test đảm bảo trong tập ứng viên trộn cả Natural + LGD, biến thiên của `cut` vẫn có ảnh hưởng thực chất lên Quality (không bị cert lấn át hoàn toàn).

**Owner:** BE (module `compute()` — hàm tính Quality)
**Chặn:** Toàn bộ Bước 2 (WSM) vì Quality là 1/4 tiêu chí chính

---

## 2. 🟡 Ưu tiên 2 — Nên sửa trước khi launch

### 2.1 Ngưỡng Rule R2 chưa khớp thực tế dữ liệu

**Vấn đề:** R2 quy định "ngân sách < 15 triệu AND carat ≥ 2.0 → cảnh báo ngân sách không thực tế", với lý do "gần như không có hàng". Thực tế: có **4 viên LGD ≥2ct dưới 15tr** (rẻ nhất 10.14tr; còn 12tr, 12.6tr, 14.2tr). Với ngưỡng 15tr, rule sẽ cảnh báo oan cho khách dù họ vẫn mua được hàng thật.

**Việc cần làm:**
- [ ] Đổi ngưỡng từ `< 15 triệu` → `< 10 triệu` (đúng điểm thực sự có 0 kết quả trong data hiện tại)
- [ ] Cập nhật lại message cảnh báo cho khớp ngưỡng mới

**Owner:** BE / Data

---

### 2.2 Công thức Finance gần như là biến thể của giá tiền

**Vấn đề:**
```
Finance = price × resale_rate
```
Vì `resale_rate` chỉ có 2 giá trị cố định theo origin (0.9 Natural / 0.6 LGD), Finance gần như tỷ lệ thuận tuyệt đối với `price`. Viên càng đắt trong ngân sách càng thắng điểm Finance, bất kể "đáng đồng tiền" hay không — ngược tinh thần trade-off mà Size (carat/giá) đang cố đo. Hai tiêu chí liên tục kéo co nhau chỉ vì cùng bị chi phối bởi `price`.

**Việc cần làm:**
- [ ] Đổi công thức sang dùng tỷ lệ giữ giá thay vì giá trị tuyệt đối, ví dụ:
  ```
  Finance = norm(resale_rate)               # đơn giản nhất
  # hoặc
  Finance = norm(price_per_carat × resale_rate)   # nếu vẫn muốn phản ánh phần nào giá trị tuyệt đối
  ```
- [ ] Đánh giá lại ảnh hưởng lên thứ hạng Top 8 sau khi đổi công thức (so sánh trước/sau trên vài kịch bản ngân sách mẫu)

**Owner:** BE

---

### 2.3 Trọng số preset "Cưới/Diện" mâu thuẫn với rule R8 đã duyệt

**Vấn đề:** Bảng preset hiện tại cho "Cưới/Diện": Size = 0.40 > Quality = 0.30. Nhưng **R8** (đã thống nhất trước đó) nói: "nhẫn cưới/diện cần viên sáng, màu J trở xuống nhìn xỉn rõ" — tức domain logic coi **Quality mới là ưu tiên hàng đầu** cho mục đích này, không phải Size. Preset hiện tại đi ngược lại chính rule đã duyệt.

**Việc cần làm:**
- [ ] Điều chỉnh lại trọng số preset "Cưới/Diện" để Quality ≥ Size (ví dụ: Quality 4, Size 3, Finance 2, Environment 1)
- [ ] Rà soát lại 3 preset còn lại (Tích lũy, Cân bằng, Môi trường) xem có mâu thuẫn tương tự với R7/R9 không

**Owner:** BE/Product

---

### 2.4 Danh sách "Mục đích" (purpose) chưa thống nhất giữa FE và bảng preset

**Vấn đề:** Step 1 (User Flow, FE) hiện chỉ có 3 lựa chọn: *Nhẫn cưới / Tích trữ / Quà tặng*. Trong khi bảng preset trọng số (Bước 2) có **4 lựa chọn**: *Cưới/Diện, Tích lũy, Cân bằng, Môi trường*. "Cân bằng" và "Môi trường" chưa có chỗ đứng trong luồng nhập liệu FE; "Quà tặng" chưa map vào preset nào.

**Việc cần làm:**
- [ ] Quyết định: thêm "Cân bằng" và "Môi trường" vào lựa chọn Step 1 của FE, HOẶC gộp "Quà tặng" ánh xạ logic vào 1 trong các preset có sẵn (đề xuất: Quà tặng → Cân bằng)
- [ ] Cập nhật đồng bộ: `plan.md` (Step 1 UI), bảng `weight_presets` trong DB, và enum `purpose` trong API contract

**Owner:** FE/Product (quyết định), BE (cập nhật enum + DB)

---

## 3. 🟢 Ưu tiên 3 — Có thể làm song song, không chặn tiến độ

- [ ] Viết unit test riêng cho từng rule R1–R10 dựa trên số liệu đã kiểm chứng trên data thật (VD: test R5 với đúng 2 viên DJL/IGI ≥100tr; test R1 với ngưỡng 30tr/48tr)
- [ ] Setup bảng `business_rules` trong PostgreSQL (data-driven, không hard-code trong code) theo thiết kế đã bàn trong `plan.md`
- [ ] Seed dữ liệu `diamonds` từ `data_ready.xlsx` vào PostgreSQL — data đã sạch, sẵn sàng dùng ngay (đã verify: không có `price=0`, `carat>6`, hay `price>2 tỷ`)
- [ ] FE tiếp tục build Step 1 (form ngân sách + mục đích) và Step 3 (UI kết quả) — không phụ thuộc các sửa đổi công thức ở Ưu tiên 1–2 nên làm song song được

---

## 4. Thứ tự thực hiện đề xuất (nếu làm tuần tự)

```
1. Họp nhanh Data/Product/BE  →  chốt phương án sửa R4 (Hướng A hay B)
2. Sửa code compute():
   - Quality: chuẩn hoá cut_score/cert_score riêng trước khi gộp
   - Finance: đổi công thức, tránh phụ thuộc tuyệt đối vào price
   (làm cùng lúc vì đụng chung 1 module)
3. Cập nhật bảng weight_presets + business_rules trong DB
   theo các con số đã sửa (mục 1.1, 2.1, 2.3)
4. Viết test để khoá lại hành vi đúng, tránh regression về sau
5. Chốt & đồng bộ danh sách "purpose" giữa FE Step 1 và preset (mục 2.4)

// Song song từ ngày 1: FE build Step 1 + Step 3 UI (mục 3, việc 4)
//                       Seed data + setup bảng business_rules (mục 3, việc 2-3)
```

---

## 5. Bảng theo dõi tổng hợp (checklist)

| # | Vấn đề | Mức độ | Owner | Trạng thái |
|---|---|---|---|---|
| 1.1 | R4 loại 100% LGD khỏi Top 5 | 🔴 | Data/BE | ☐ |
| 1.2 | Quality bị cert lấn át, trùng lặp origin | 🔴 | BE | ☐ |
| 2.1 | Ngưỡng R2 sai lệch thực tế | 🟡 | BE/Data | ☐ |
| 2.2 | Finance ≈ biến thể của price | 🟡 | BE | ☐ |
| 2.3 | Preset "Cưới/Diện" mâu thuẫn R8 | 🟡 | BE/Product | ☐ |
| 2.4 | Danh sách purpose FE vs preset lệch nhau | 🟡 | FE/Product/BE | ☐ |
| 3.1 | Unit test cho R1–R10 | 🟢 | BE | ☐ |
| 3.2 | Setup bảng `business_rules` trong DB | 🟢 | BE | ☐ |
| 3.3 | Seed dữ liệu `diamonds` | 🟢 | BE | ☐ |
| 3.4 | FE build Step 1 + Step 3 | 🟢 | FE | ☐ |

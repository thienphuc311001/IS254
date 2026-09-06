# Kịch bản quay video demo — DSS Diamond (3–5 phút)

Người demo: Minh. Mục tiêu: trong 4 phút, cho thấy (1) app chạy trên dữ liệu thật, (2) đủ 3 bước thuật toán
Lọc cứng → WSM → Luật chuyên gia, (3) cả 4 luật R1–R4 đều được kích hoạt trên màn hình, (4) tính đánh đổi
Tự nhiên vs LGD mà báo cáo nhấn mạnh.

Mọi con số bên dưới đã được xác minh bằng test tự động trên `data_ready.xlsx`. Cứ nhập đúng là ra đúng.

---

## 0. Chuẩn bị (làm trước khi bấm ghi)

**Máy và trình duyệt**
- `npm run dev`, mở `http://localhost:3000`. Tải trang một lần cho font và dữ liệu vào cache.
- Chrome cửa sổ rộng ≥ 1400 px, zoom 100%. Ẩn thanh bookmark (Cmd+Shift+B). Đóng các tab khác.
- Tắt thông báo hệ thống (Focus / Do Not Disturb). Tắt Slack, Messenger.
- Tải lại trang (F5) ngay trước khi ghi để về trạng thái mặc định.

**Ghi hình**
- QuickTime (File → New Screen Recording) hoặc OBS. Chọn ghi **chỉ cửa sổ Chrome**, 1080p, 30 fps.
- Bật mic, nói thử 5 giây và nghe lại. Đeo tai nghe để không vọng.
- Bật "Show mouse clicks" nếu có, để người xem thấy bạn bấm gì.

**Thao tác nhập cho gọn**
- Gõ số vào ô bên phải slider rồi Enter. Nhanh và chính xác hơn kéo slider.
- Luôn bấm nút mục đích trước mỗi kịch bản để nạp preset trọng số.
- Nói chậm khi đọc con số. Chờ 1 giây sau mỗi thao tác để bảng và biểu đồ cập nhật rồi mới nói tiếp.

---

## 1. Kịch bản theo mốc thời gian

### 0:00 – 0:30 · Mở đầu (màn hình mặc định, chưa bấm gì)

Nói:
> "Xin chào, em là Minh, nhóm 01. Đây là hệ hỗ trợ ra quyết định chọn kim cương Tự nhiên hay Nhân tạo.
> Ứng dụng chạy trên dữ liệu thật: **763 viên** từ **5 cửa hàng** Việt Nam, gồm **645 Tự nhiên** và **118 LGD**.
> Hệ thống có 3 tầng: dữ liệu ở file Excel nạp lúc chạy, tầng mô hình 3 bước, và giao diện các bạn đang thấy."

Chỉ chuột: góc trên phải (số liệu), footer (nguồn dữ liệu + dòng "Hard Filter → WSM → Rule-based override").

### 0:30 – 1:00 · Đi một vòng giao diện

Chỉ chuột theo thứ tự:
- Sidebar trái: ngân sách, carat tối thiểu, 3 mục đích, 4 slider ưu tiên, nút eco, màu và độ trong.
- Banner: kết luận **"Kim cương Tự nhiên"** với preset Cưới mặc định.
- Hai thẻ so sánh: Tự nhiên lớn nhất **0,96 ct**, LGD lớn nhất **4,93 ct** cùng ngân sách 60 triệu.
- Biểu đồ Carat × Giá: điểm sáng là viên qua bộ lọc, viền trắng là Top 5, đường đứt đỏ là ngân sách.
- Bảng Top 5: viên đầu **0,50 ct D/VS1 GIA – 29.900.000 đ**.

Nói:
> "Với preset Cưới ưu tiên chất lượng và giữ giá, hệ thống nghiêng về Tự nhiên. Nhưng thẻ bên phải cho thấy
> cùng 60 triệu, LGD mua được viên gấp 5 lần về carat. Đây chính là bài toán đánh đổi mà mô hình giải."

### 1:00 – 1:45 · UC1 · Luật R1 — ngân sách hẹp, cần ≥ 1 ct

Thao tác: bấm **Nhẫn cưới** → ngân sách **25000000** Enter → carat **1** Enter → màu **D–J** → độ trong **FL–SI2 (mọi loại)**.

Kỳ vọng trên màn hình:
- Cờ đỏ **[R1]** "…không có kim cương Tự nhiên nào thỏa mãn — hệ thống ghi đè gợi ý sang LGD."
- Kết luận đổi sang **"Kim cương Nhân tạo (LGD)"**.
- Top 5 toàn LGD, đầu bảng **1,73 ct E/VS1 – 6.500.000 đ**.

Nói:
> "Bước 1 lọc cứng đã loại mọi viên trên 25 triệu hoặc dưới 1 carat. Bước 3, luật R1 quét toàn bộ dữ liệu:
> viên Tự nhiên 1 carat rẻ nhất giá 48 triệu, nên không có phương án Tự nhiên. Hệ thống ghi đè và giải thích rõ lý do."

### 1:45 – 2:30 · UC2 · Luật R4 (Cưới) + R3 — nhẫn cưới cần màu sáng

Thao tác: bấm **Nhẫn cưới** → ngân sách **120000000** Enter → carat **1.2** Enter → màu **D–J** → độ trong **FL–VS2**.

Kỳ vọng:
- Hai cờ xanh **[R3]** và **[R4]**.
- Top 1 là **1,22 ct H/VS2 GIA – 108.000.000 đ**. Toàn bảng đều GIA.

Nói:
> "Bước 2 WSM chấm điểm thì viên 1,23 carat màu J đứng đầu vì to hơn. Nhưng nhẫn cưới đeo hằng ngày cần màu sáng,
> luật R4 đổi Top 1 sang viên màu H. Đồng thời ngân sách trên 100 triệu nên luật R3 chỉ giữ viên có chứng nhận GIA."

### 2:30 – 3:00 · UC3 · Luật R3 — tích trữ, ưu tiên giữ giá

Thao tác: bấm **Tích trữ** → ngân sách **150000000** Enter → carat **0.5** Enter → màu **D–F** → độ trong **FL–VS2**.

Kỳ vọng:
- Cờ **[R3]**. Kết luận **"Kim cương Tự nhiên"**.
- 5/5 viên Tự nhiên GIA, đầu bảng **0,50 ct D/VS1 GIA – 29.900.000 đ**.

Nói:
> "Preset Tích trữ đẩy trọng số giữ giá lên 5. Tự nhiên giữ 90% giá trị so với 60% của LGD nên chiếm trọn Top 5,
> và R3 bảo đảm tất cả đều GIA, chuẩn thanh khoản của thị trường."

### 3:00 – 3:30 · UC4 · Luật R2 — nhãn "giá cao"

Thao tác: bấm **Nhẫn cưới** → ngân sách **800000000** Enter → carat **2** Enter → màu **D–F** → độ trong **FL–VS2**.

Kỳ vọng:
- Chỉ còn **2 viên**, cả hai có nhãn nhỏ **"giá cao"** cạnh badge Tự nhiên. Cờ **[R3]**.
- Di chuột lên nhãn "giá cao" để hiện tooltip "Giá trên mỗi carat cao hơn mặt bằng chung (R2)". **Giữ chuột 2 giây.**

Nói:
> "Phân khúc trên 2 carat rất hiếm, chỉ 2 viên. Luật R2 không loại viên nào, chỉ gắn nhãn cảnh báo khi đơn giá
> vượt 150 triệu một carat, ví dụ viên 2,01 carat này giá 678 triệu, tức khoảng 337 triệu mỗi carat."

### 3:30 – 4:15 · UC5 · Eco toggle — trọng số môi trường

Thao tác: bấm **Quà tặng / Cá nhân** → ngân sách **120000000** Enter → carat **0.5** Enter → màu **D–F** → độ trong **FL–VS2**.
Dừng 2 giây cho người xem thấy Top 5 toàn Tự nhiên GIA và cờ **[R3]**.
Rồi tick **"Ưu tiên thân thiện môi trường"**.

Kỳ vọng sau khi tick:
- Top 5 đảo sang **toàn LGD**, đầu bảng **1,73 ct E/VS1 – 6.500.000 đ**. Cờ R3 tắt.
- Biểu đồ: các điểm viền trắng nhảy từ cụm vàng sang cụm xanh.

Nói:
> "Cùng một ngân sách, chỉ bật một tuỳ chọn: trọng số môi trường được trộn 60/40 với vector eco, tăng từ 0,18 lên 0,29.
> Top 5 đảo hoàn toàn sang LGD. Bảng tác động môi trường phía trên giải thích vì sao: LGD tiêu thụ ít đất và nước hơn hẳn."

Chỉ chuột nhanh lên hai thẻ "Tác động môi trường" khi nói câu cuối.

### 4:15 – 4:45 · Kết

Bỏ tick eco, kéo slider ngân sách qua lại 2 lần để thấy mọi thứ cập nhật tức thì.

Nói:
> "Toàn bộ mô hình là tất định và minh bạch: mỗi khuyến nghị đều chỉ ra được đúng luật và con số tạo nên nó.
> Hạn chế hiện tại là tỷ lệ giữ giá là giả định chuyên gia và chưa tính giá vỏ trang sức, đây là hướng phát triển tiếp.
> Em xin hết, cảm ơn thầy và các bạn."

---

## 2. Bảng tra nhanh (dán cạnh màn hình khi quay)

| UC | Nút mục đích | Ngân sách | Carat | Màu | Độ trong | Eco | Cờ | Top 1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mặc định | (Nhẫn cưới) | 60.000.000 | 0.5 | D–F | FL–VS2 | tắt | — | 0,50 ct D/VS1 GIA · 29,9 tr · Tự nhiên |
| UC1 | Nhẫn cưới | 25.000.000 | 1 | D–J | FL–SI2 | tắt | R1 | 1,73 ct E/VS1 · 6,5 tr · LGD |
| UC2 | Nhẫn cưới | 120.000.000 | 1.2 | D–J | FL–VS2 | tắt | R3, R4 | 1,22 ct H/VS2 GIA · 108 tr |
| UC3 | Tích trữ | 150.000.000 | 0.5 | D–F | FL–VS2 | tắt | R3 | 0,50 ct D/VS1 GIA · 29,9 tr |
| UC4 | Nhẫn cưới | 800.000.000 | 2 | D–F | FL–VS2 | tắt | R3 + nhãn "giá cao" | 2 viên, cả hai gắn nhãn |
| UC5a | Quà tặng | 120.000.000 | 0.5 | D–F | FL–VS2 | tắt | R3 | Tự nhiên GIA |
| UC5b | Quà tặng | 120.000.000 | 0.5 | D–F | FL–VS2 | **bật** | — | 1,73 ct E/VS1 · 6,5 tr · LGD |

---

## 3. Mẹo để video trông chuyên nghiệp

- **Quay từng UC một đoạn riêng** rồi ghép. Sai một câu chỉ quay lại 40 giây thay vì cả bài. iMovie hoặc CapCut ghép được.
- **Một câu, một thao tác.** Làm xong thao tác, dừng tay, rồi nói. Không vừa kéo slider vừa nói.
- **Đọc số theo báo cáo**: "sáu triệu rưỡi", "một phẩy bảy ba carat". Người chấm sẽ đối chiếu với README và báo cáo.
- **Chuột đi chậm, dừng ở thứ đang nói.** Không vẽ vòng tròn bằng chuột.
- **Ba lần nhắc tên 3 bước** (Lọc cứng, WSM, Luật chuyên gia) rải trong bài. Đây là xương sống của báo cáo.
- **Không mở DevTools, không mở code.** Video là demo sản phẩm, không phải review kỹ thuật.
- Nếu muốn 30 giây thêm điểm: cuối UC1 kéo carat lên 3 và ngân sách xuống 3 triệu để hiện trạng thái rỗng
  "Chưa có kết quả", rồi nói "hệ thống không bao giờ gợi ý bừa khi không có phương án thoả ràng buộc".

## 4. Nếu có sự cố khi quay

- Trang không tải dữ liệu: F5. Nếu vẫn lỗi, kiểm tra `npm run dev` còn chạy.
- Số nhập không nhận: bấm Enter hoặc click ra ngoài ô, giá trị sẽ được kẹp vào khoảng hợp lệ.
- Bấm nút mục đích không đổi slider: bấm lại lần nữa, nút đang chọn vẫn nạp lại preset.
- Kết quả khác bảng tra: kiểm tra lại màu và độ trong, đây là hai chỗ dễ chọn nhầm nhất.

# Báo cáo phân tích thuật toán và mô hình

## 1. Mục tiêu mô hình

Hệ thống hỗ trợ người dùng chọn kim cương phù hợp với ngân sách, kích thước mong muốn, mục đích sử dụng và mức ưu tiên cá nhân. Vấn đề bản chất là bài toán ra quyết định đa tiêu chí (Multi-Criteria Decision Making — MCDM): mỗi viên kim cương cần được đánh giá đồng thời theo kích thước, khả năng giữ giá, chất lượng và tác động môi trường, trong khi một số ràng buộc phải được thỏa tuyệt đối.

Vì lý do đó, đề tài kết hợp hai thành phần:

- **Weighted Sum Model (WSM)** để xếp hạng tương đối các phương án theo sở thích người dùng.
- **Rule-based reasoning** để áp dụng kiến thức chuyên gia, xử lý ngoại lệ dữ liệu và ghi đè kết quả khi WSM chưa đủ an toàn.

## 2. Luồng thuật toán tổng thể

Thuật toán chính nằm trong hàm `compute()` của `app.js` và gồm ba lớp:

```text
data_ready.xlsx
      ↓
Hard Filter — lọc ràng buộc cứng
      ↓
Weighted Scoring Model — tính điểm đa tiêu chí
      ↓
Rule-based Override — điều chỉnh và cảnh báo chuyên gia
      ↓
Top 5 phương án + biểu đồ trade-off + cảnh báo UI
```

Cách tiếp cận này phù hợp hơn với một mô hình học máy thuần túy trong bối cảnh hiện tại vì:

- Dữ liệu chỉ có 763 mẫu và không có nhãn “nên mua/không nên mua” do chuyên gia gán.
- Người dùng cần kết quả giải thích được: vì sao một viên được đứng đầu.
- Nghiệp vụ mua kim cương có nhiều quy tắc rõ ràng về chứng nhận, giữ giá và phân khúc ngân sách.
- Hệ thống phải phản hồi tức thời khi người dùng kéo slider, nên chi phí tính toán cần thấp và deterministic.

## 3. Tiền xử lý và mã hóa dữ liệu

Dữ liệu sử dụng là sheet `data_ready` gồm 763 dòng sau làm sạch, gồm 645 viên tự nhiên và 118 viên nhân tạo LGD. Trước khi vào mô hình, các thuộc tính định tính được chuyển sang thang số tăng dần theo chiều tốt hơn:

| Thuộc tính     | Cách mã hóa                                            | Ý nghĩa                              |
| ---------------- | --------------------------------------------------------- | -------------------------------------- |
| Màu sắc        | `D = 10`, giảm dần đến `N = 0`                    | Giá trị càng cao càng trắng/sáng |
| Độ tinh khiết | `FL = 8`, giảm dần đến `SI2 = 1`                  | Giá trị càng cao càng sạch        |
| Giác cắt       | `Excellent = 3`, còn lại/thiếu = `2`               | Thang điểm cắt                      |
| Chứng nhận     | `GIA = 3`, `IGI = 2`, `DJL = 1`, không rõ = `0` | Mức độ tin cậy kiểm định        |
| Nguồn gốc      | `is_natural = 1` hoặc `0`                            | Phân biệt Natural và LGD            |

Với viên thiếu `cut_raw`, hệ thống không loại bỏ mà gán điểm Very Good tương ứng `0.85`, đồng thời hiển thị nhãn minh bạch trên giao diện. Đây là quyết định thực dụng giúp tránh mất thông tin do thiếu một thuộc tính duy nhất.

## 4. Lớp 1 — Hard Filter

Trước tiên, hệ thống loại bỏ những viên không thể là phương án hợp lệ. Đây là phần ràng buộc cứng, không dùng trọng số:

```text
price ≤ budget
carat ≥ minCarat
color_code ≥ minColorCode
clarity_code ≥ minClarityCode
0 < price ≤ 2,000,000,000 VNĐ
carat ≤ 6 ct
```

Hai điều kiện cuối là sanity check R10 nhằm loại dữ liệu bất thường hoặc ngoài phạm vi tin cậy. Lớp này quan trọng vì WSM chỉ nên so sánh những phương án khả thi; nếu không lọc trước, một viên rẻ nhưng quá nhỏ hoặc vượt ngân sách vẫn có thể nhận điểm cao ở một vài tiêu chí riêng lẻ.

Độ phức tạp của bước này là `O(n)`, trong đó `n` là số dòng dữ liệu.

## 5. Lớp 2 — Weighted Sum Model

### 5.1 Công thức tổng quát

Mỗi phương án còn lại được tính điểm tổng hợp:

```text
Score(x) = w₁ · S_size(x)
         + w₂ · S_finance(x)
         + w₃ · S_quality(x)
         + w₄ · S_environment(x)
```

Trong đó `w₁…w₄` là trọng số người dùng chọn từ 0 đến 5 qua bốn slider, sau đó chuẩn hóa:

```text
wᵢ' = wᵢ / Σwⱼ
```

Nhờ vậy, điểm tổng luôn nằm trong đoạn `[0, 1]` nếu từng tiêu chí con cũng được chuẩn hóa về `[0, 1]`.

### 5.2 Giá trị thô của bốn tiêu chí

| Tiêu chí  | Hàm giá trị thô               | Ý nghĩa kinh tế                                        |
| ----------- | --------------------------------- | --------------------------------------------------------- |
| Size        | `carat / (price / 1,000,000)`   | Số carat nhận được trên mỗi triệu đồng          |
| Finance     | `price × resale_rate`          | Giá trị thu hồi ước tính khi bán lại              |
| Quality     | `(cut_score + cert_score) / 2`  | Kết hợp giác cắt và độ tin cậy chứng nhận       |
| Environment | LGD =`0.85`, Natural = `0.15` | Ưu tiên phương án ít ảnh hưởng khai khoáng hơn |

### 5.3 Chuẩn hóa min-max

Các giá trị thô có đơn vị khác nhau nên không thể cộng trực tiếp. Hệ thống dùng min-max normalization trên tập ứng viên hiện tại:

```text
Sⱼ(x) = (vⱼ(x) - min(vⱼ)) / (max(vⱼ) - min(vⱼ))
```

Nếu `max = min`, hệ thống gán điểm trung lập `0.5` để tránh chia cho 0. Tập chuẩn hóa là tập đã lọc; nếu tập này rỗng thì mới dùng toàn bộ dữ liệu làm nền dự phòng.

Việc chuẩn hóa theo ngữ cảnh người dùng là có chủ đích: cùng một viên kim cương có thể nhận điểm Size khác nhau tùy ngân sách và carat tối thiểu đang xét. Như vậy điểm số phản ánh tương quan trong tập lựa chọn hiện tại chứ không cố định theo toàn bộ thị trường.

### 5.4 Bộ preset mục đích sử dụng

Hệ thống cung cấp bốn bộ trọng số mặc định:

| Mục đích    | Size | Finance | Quality | Environment |
| -------------- | ---: | ------: | ------: | ----------: |
| Cưới / Diện |    4 |       2 |       3 |           1 |
| Tích lũy     |    2 |       5 |       3 |           1 |
| Cân bằng     |    3 |       3 |       3 |           2 |
| Môi trường  |    2 |       2 |       2 |           5 |

Cơ chế preset giúp người dùng không phải hiểu ngay khái niệm trọng số nhưng vẫn chỉnh sửa lại nếu muốn.

Sau bước tính điểm, danh sách được sắp xếp giảm dần theo `Score`. Hệ thống lấy 8 viên đầu thay vì 5 để còn dư địa cho các quy tắc hoán đổi và ghi đè ở lớp tiếp theo. Độ phức tạp trung bình của bước này là `O(n log n)` do thao tác sắp xếp.

## 6. Lớp 3 — Rule-based Override

Lớp này đóng vai trò kiến thức chuyên gia và cơ chế an toàn. Các quy tắc chính như sau:

| Quy tắc | Điều kiện                                                                | Hành động                                                            |
| -------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| R1       | Không có Natural có chứng nhận thỏa ngân sách và carat tối thiểu | Ưu tiên LGD lên trước trong Top và hiển thị cảnh báo ghi đè |
| R2       | Ngân sách dưới 10 triệu và yêu cầu carat ≥ 2.0                     | Cảnh báo yêu cầu phi thực tế                                      |
| R3       | Giá mỗi carat vượt ngưỡng Natural 150 triệu hoặc LGD 30 triệu      | Gắn nhãn “giá cao”                                                 |
| R4       | Chứng nhận không rõ nguồn gốc                                         | Gắn nhãn “chưa xác minh”, không loại khỏi kết quả            |
| R5       | Ngân sách ≥ 100 triệu và tồn tại Natural GIA                         | Lọc Top theo hướng ưu tiên GIA                                     |
| R6       | Top 1 có màu ≤ K hoặc độ tinh khiết ≤ SI2                           | Cảnh báo chất lượng thấp                                          |
| R7       | Mục đích là Tích lũy và có Natural GIA                              | Ưu tiên Natural GIA lên Top 1                                        |
| R8       | Mục đích là Cưới và Top 1 màu ≤ J                                  | Hoán đổi sang viên sáng hơn nếu có                              |
| R9       | Mục đích là Môi trường và Natural chỉ nhỉnh LGD ≤ 10%            | Đẩy LGD lên Top 1                                                    |
| R10      | Giá bằng 0, giá trên 2 tỷ hoặc carat trên 6                          | Loại khỏi tập tính toán                                            |
| R11      | Thiếu giá trị giác cắt                                                 | Gán điểm Very Good và hiển thị nhãn thiếu dữ liệu             |

Thiết kế này phân biệt rõ hai loại tri thức:

- **Ràng buộc tuyệt đối**: ví dụ ngân sách, carat tối thiểu, giới hạn dữ liệu bất thường.
- **Ưu tiên mềm**: ví dụ GIA cho phân khúc cao cấp, LGD cho mục đích môi trường.

Nhờ đó, hệ thống vừa đảm bảo tính nghiệp vụ, vừa không quá cứng nhắc trong việc gợi ý.

## 7. Phân tích ưu điểm

1. **Giải thích được**: mỗi kết quả có thể traced ngược về điểm bốn tiêu chí, trọng số người dùng và quy tắc đã kích hoạt.
2. **Phản hồi nhanh**: toàn bộ pipeline chạy trong trình duyệt, chỉ thao tác trên 763 dòng nên phù hợp cập nhật realtime khi kéo slider.
3. **Kết hợp định lượng và định tính**: WSM xử lý sở thích liên tục, rule engine xử lý nghiệp vụ rời rạc.
4. **Chuẩn hóa theo ngữ cảnh**: điểm số thích ứng với tập lựa chọn hiện tại thay vì dùng thang cứng.
5. **Minh bạch với dữ liệu thiếu**: viên thiếu cut không bị âm thầm loại bỏ mà được gán giả định và cảnh báo.

## 8. Hạn chế và rủi ro mô hình

1. **Min-max phụ thuộc tập ứng viên**: thêm hoặc bớt một viên có thể làm đổi thang điểm của mọi viên còn lại, khiến điểm tuyệt đối không ổn định giữa hai lần truy vấn.
2. **Giả thiết độc lập tuyến tính**: WSM coi các tiêu chí không có sự đánh đổi phi tuyến. Ví dụ, một viên carat lớn nhưng chứng nhận kém vẫn có thể đạt điểm cao nếu trọng số Size lớn.
3. **Bộ quy tắc thủ công**: hiệu quả phụ thuộc ngưỡng 10 triệu, 100 triệu, 150 triệu/ct, 30 triệu/ct. Nếu thị trường thay đổi, cần bảo trì lại tham số.
4. **Dữ liệu chưa đủ cho mô hình học máy**: không có nhãn hành vi mua thực tế hay kết quả bán lại thật nên chưa thể huấn luyện mô hình dự đoán đáng tin cậy.
5. **Tác động môi trường được rút gọn**: mô hình chỉ dùng hai mức 0.85 và 0.15, chưa đo lường lượng carbon hay năng lượng theo từng nhà sản xuất.

## 9. Hướng phát triển

Ngắn hạn, hệ thống có thể nâng cấp từ WSM sang các phương pháp MCDM mạnh hơn về mặt lý thuyết:

- **TOPSIS**: xếp hạng theo khoảng cách tới phương án lý tưởng và chống-ly tưởng, giúp giảm cảm giác “điểm cao chỉ vì tốt nhất một tiêu chí”.
- **AHP**: cho phép suy ra trọng số từ các phép so sánh cặp, phù hợp khi người dùng khó chọn trực tiếp số sao.
- **PROMETHEE**: xử lý tốt hơn quan hệ ưu tiên từng cặp và các ngưỡng indifference/preference.

Nếu dữ liệu mở rộng có nhãn hành vi người mua, lịch sử giá bán lại và đặc tính môi trường chi tiết, đề tài có thể bổ sung lớp học máy:

- Hồi quy hoặc gradient boosting để dự đoán mức giá hợp lý theo 4C và nguồn gốc.
- Ranking learning để học thứ tự sản phẩm từ hành vi chọn của người dùng.
- Clustering để phân khúc tự nhiên các nhóm khách hàng và sinh preset trọng số động.

Tuy nhiên, lớp rule engine vẫn nên giữ lại vì nhiều quy tắc ngành là yêu cầu bắt buộc hoặc cần giải thích trực tiếp cho người dùng.

## 10. Kết luận

Mô hình hiện tại là một hệ DSS lai giữa MCDM và rule-based reasoning. WSM cung cấp cơ chế xếp hạng linh hoạt theo sở thích cá nhân, trong khi bộ quy tắc R1–R11 bổ sung tri thức chuyên gia, kiểm soát dữ liệu bất thường và cảnh báo rủi ro. Thiết kế này cân bằng tốt giữa độ chính xác nghiệp vụ, tốc độ phản hồi và khả năng giải thích, phù hợp với phạm vi dữ liệu 763 dòng của đề tài.

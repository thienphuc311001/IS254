# Lời thoại demo đầy đủ — DSS Diamond

Người nói: Minh. Thời lượng mục tiêu: 4 phút 30 giây đến 5 phút.
Cách đọc: dòng in nghiêng trong ngoặc vuông là thao tác và chỉ chuột, không đọc. Phần còn lại đọc nguyên văn.
Tốc độ: chậm hơn nói chuyện bình thường một chút. Sau mỗi thao tác dừng một nhịp rồi mới nói tiếp.

---

## PHẦN 1 · MỞ ĐẦU — 0:00 đến 0:35

*[Màn hình: trang vừa tải xong, trạng thái mặc định. Chưa bấm gì. Chuột để yên ở giữa banner.]*

Xin chào thầy và các bạn. Em là Nguyễn Thanh Minh, thành viên nhóm 01. Em xin demo sản phẩm của nhóm: Hệ hỗ trợ ra quyết định lựa chọn kim cương Tự nhiên hay Nhân tạo.

Bài toán nhóm giải quyết là một bài toán ra quyết định đa tiêu chí. Kim cương Tự nhiên giữ giá tốt hơn nhưng đắt hơn nhiều. Kim cương nhân tạo, gọi tắt là LGD, cho viên to hơn với cùng số tiền và thân thiện môi trường hơn, nhưng giữ giá kém hơn. Không có phương án nào thắng tuyệt đối, nên người mua cần một công cụ để cân nhắc theo nhu cầu riêng.

*[Chuột chỉ lên góc trên bên phải, dòng số liệu.]*

Ứng dụng chạy trên dữ liệu thật. Ở đây là bảy trăm sáu mươi ba viên kim cương thu thập từ năm cửa hàng tại Việt Nam, gồm sáu trăm bốn mươi lăm viên Tự nhiên và một trăm mười tám viên LGD.

*[Chuột kéo xuống footer, chỉ dòng "Nguồn dữ liệu" rồi dòng "Mô hình".]*

Toàn bộ số liệu trên trang, kể cả danh sách cửa hàng ở đây, đều được sinh tự động từ file dữ liệu, không có con số nào gõ tay. Hệ thống có ba tầng theo đúng kiến trúc DSS: tầng dữ liệu là file Excel được nạp lúc chạy, tầng mô hình gồm ba bước là Lọc cứng, Chấm điểm có trọng số WSM, và Ghi đè theo luật chuyên gia, và tầng giao diện là trang các bạn đang thấy.

---

## PHẦN 2 · ĐI MỘT VÒNG GIAO DIỆN — 0:35 đến 1:10

*[Chuột chỉ sidebar bên trái, đi từ trên xuống theo lời nói.]*

Bên trái là nơi người dùng nhập nhu cầu. Ngân sách tối đa. Carat tối thiểu. Mục đích mua, gồm Nhẫn cưới, Tích trữ, và Quà tặng. Mỗi mục đích đi kèm một bộ trọng số mặc định cho bốn tiêu chí: kích thước, giữ giá, chất lượng, và môi trường. Người dùng có thể chỉnh lại từng slider. Bên dưới là nút ưu tiên môi trường, và hai ràng buộc chất lượng tối thiểu về màu và độ tinh khiết.

*[Chuột chỉ banner kết luận.]*

Bên phải là kết quả, cập nhật ngay khi thay đổi bất kỳ tham số nào. Trên cùng là khuyến nghị của hệ thống. Với thiết lập mặc định là mục đích Nhẫn cưới, sáu mươi triệu, carat tối thiểu không phẩy năm, hệ thống khuyến nghị Kim cương Tự nhiên, vì preset Cưới ưu tiên chất lượng và khả năng giữ giá.

*[Chuột chỉ hai thẻ so sánh, thẻ vàng rồi thẻ xanh.]*

Hai thẻ này cho thấy sự đánh đổi. Cùng sáu mươi triệu, viên Tự nhiên lớn nhất mua được là không phẩy chín sáu carat, giữ giá chín mươi phần trăm. Trong khi viên LGD lớn nhất là bốn phẩy chín ba carat, gấp năm lần, nhưng chỉ giữ giá sáu mươi phần trăm.

*[Chuột chỉ biểu đồ.]*

Biểu đồ này là bản đồ thị trường theo carat và giá. Mỗi điểm là một viên. Điểm sáng là viên qua được bộ lọc, điểm viền trắng là năm viên được xếp hạng cao nhất, đường đứt màu đỏ là mức ngân sách.

*[Chuột chỉ bảng Top 5, dừng ở dòng 1.]*

Và cuối cùng là bảng Top 5 đề xuất, kèm điểm số và đường dẫn về cửa hàng. Viên đứng đầu hiện tại là không phẩy năm carat, màu D, độ trong VS1, chứng nhận GIA, giá hai mươi chín triệu chín trăm nghìn.

Bây giờ em sẽ đi qua năm kịch bản để thấy cả ba bước của mô hình và bốn luật chuyên gia hoạt động.

---

## PHẦN 3 · KỊCH BẢN 1 — LUẬT R1 — 1:10 đến 1:55

*[Bấm nút "Nhẫn cưới". Gõ ô ngân sách 25000000, Enter. Gõ ô carat 1, Enter. Chọn màu "D–J". Chọn độ trong "FL–SI2 (mọi loại)". Dừng một nhịp.]*

Kịch bản một. Một người mua nhẫn cưới với ngân sách khá hẹp, hai mươi lăm triệu, nhưng muốn viên từ một carat trở lên, và chấp nhận mọi mức màu và độ trong.

*[Chuột chỉ cờ đỏ R1 trong banner.]*

Ngay lập tức hệ thống hiện cảnh báo R1: với ngân sách này và carat từ một trở lên, không có kim cương Tự nhiên nào thoả mãn, nên hệ thống ghi đè gợi ý sang LGD. Khuyến nghị đổi thành Kim cương Nhân tạo.

Điều đáng nói là luật R1 không dùng một ngưỡng cố định. Nó quét toàn bộ dữ liệu, và trong sáu trăm bốn mươi lăm viên Tự nhiên, viên một carat rẻ nhất có giá bốn mươi tám triệu. Vì vậy với hai mươi lăm triệu thì chắc chắn không có phương án Tự nhiên, và hệ thống nói rõ lý do thay vì trả về bảng trống.

*[Chuột chỉ bảng Top 5, dòng 1.]*

Top 5 lúc này toàn LGD. Viên đứng đầu là một phẩy bảy ba carat, màu E, độ trong VS1, giá chỉ sáu triệu rưỡi. Đây là bước ba, ghi đè theo luật chuyên gia, hoạt động đúng như báo cáo mô tả.

---

## PHẦN 4 · KỊCH BẢN 2 — LUẬT R4 VÀ R3 — 1:55 đến 2:40

*[Bấm nút "Nhẫn cưới". Gõ ngân sách 120000000, Enter. Gõ carat 1.2, Enter. Màu vẫn "D–J". Chọn độ trong "FL–VS2". Dừng một nhịp.]*

Kịch bản hai. Vẫn là nhẫn cưới, nhưng ngân sách khá hơn, một trăm hai mươi triệu, cần viên từ một phẩy hai carat, và độ trong từ VS2 trở lên.

*[Chuột chỉ hai cờ xanh R3 và R4.]*

Lần này có hai luật cùng bật. Luật R4 cho mục đích Cưới: nếu chỉ chấm điểm thuần tuý theo WSM, viên đứng đầu sẽ là viên một phẩy hai ba carat màu J, vì nó to hơn và rẻ hơn. Nhưng nhẫn cưới đeo hằng ngày cần màu sáng, nên R4 đổi Top 1 sang viên màu sáng hơn.

*[Chuột chỉ dòng 1 bảng Top 5.]*

Kết quả: viên đứng đầu là một phẩy hai hai carat, màu H, độ trong VS2, chứng nhận GIA, giá một trăm lẻ tám triệu.

Đồng thời luật R3 bật, vì ngân sách đã trên một trăm triệu. Ở phân khúc này, hệ thống chỉ giữ lại viên có chứng nhận GIA, là chuẩn thanh khoản của ngành. Các bạn thấy cột Chứng nhận toàn bộ là GIA.

Đây là ví dụ cho thấy các luật không thay thế mô hình chấm điểm, mà bổ sung ngữ cảnh thực tế mà điểm số chưa phản ánh hết.

---

## PHẦN 5 · KỊCH BẢN 3 — LUẬT R3, MỤC ĐÍCH TÍCH TRỮ — 2:40 đến 3:10

*[Bấm nút "Tích trữ". Gõ ngân sách 150000000, Enter. Gõ carat 0.5, Enter. Chọn màu "D–F". Độ trong vẫn "FL–VS2". Dừng một nhịp.]*

Kịch bản ba. Người mua để tích trữ, ngân sách một trăm năm mươi triệu, chỉ cần từ nửa carat, nhưng yêu cầu màu từ F trở lên.

*[Chuột chỉ bốn slider trọng số.]*

Khi bấm Tích trữ, các bạn thấy slider Giữ giá nhảy lên mức tối đa năm sao, đúng như bảng trọng số trong báo cáo.

*[Chuột chỉ banner rồi bảng Top 5.]*

Hệ thống khuyến nghị Kim cương Tự nhiên. Cờ R3 bật vì ngân sách trên một trăm triệu. Cả năm viên trong Top 5 đều là Tự nhiên có GIA, đứng đầu là viên nửa carat màu D, VS1, giá hai mươi chín triệu chín.

Lý do rất rõ: Tự nhiên giữ chín mươi phần trăm giá trị so với sáu mươi phần trăm của LGD, và khi trọng số giữ giá là năm thì tiêu chí này quyết định kết quả.

---

## PHẦN 6 · KỊCH BẢN 4 — LUẬT R2, NHÃN GIÁ CAO — 3:10 đến 3:45

*[Bấm nút "Nhẫn cưới". Gõ ngân sách 800000000, Enter. Gõ carat 2, Enter. Màu vẫn "D–F", độ trong vẫn "FL–VS2". Dừng một nhịp.]*

Kịch bản bốn là phân khúc siêu cao cấp. Ngân sách tám trăm triệu, cần viên từ hai carat, màu từ F trở lên.

*[Chuột chỉ bảng Top 5.]*

Phân khúc này rất hiếm hàng, chỉ còn hai viên thoả điều kiện. Cả hai đều có một nhãn nhỏ "giá cao" cạnh loại kim cương.

*[Di chuột lên nhãn "giá cao" ở dòng 1 và giữ yên hai giây cho tooltip hiện.]*

Đây là luật R2. Nó không loại viên nào, chỉ gắn nhãn cảnh báo khi đơn giá trên mỗi carat vượt ngưỡng tham chiếu, là một trăm năm mươi triệu một carat với Tự nhiên. Ví dụ viên hai phẩy không một carat này giá sáu trăm bảy mươi tám triệu, tức khoảng ba trăm ba mươi bảy triệu mỗi carat, cao hơn hẳn mặt bằng chung. Người mua vẫn được quyền chọn, nhưng được nhắc để cân nhắc.

---

## PHẦN 7 · KỊCH BẢN 5 — ƯU TIÊN MÔI TRƯỜNG — 3:45 đến 4:30

*[Bấm nút "Quà tặng / Cá nhân". Gõ ngân sách 120000000, Enter. Gõ carat 0.5, Enter. Màu vẫn "D–F", độ trong vẫn "FL–VS2". Dừng hai giây, KHÔNG bấm eco.]*

Kịch bản cuối. Mua quà tặng, ngân sách một trăm hai mươi triệu, từ nửa carat, màu từ F. Với trọng số cân bằng của preset Quà tặng, Top 5 hiện toàn Tự nhiên GIA, và cờ R3 bật.

*[Tick vào "Ưu tiên thân thiện môi trường". Dừng một nhịp.]*

Bây giờ em chỉ bật một tuỳ chọn: ưu tiên thân thiện môi trường.

*[Chuột chỉ bảng Top 5, rồi chỉ biểu đồ.]*

Toàn bộ Top 5 đảo sang LGD. Viên đứng đầu là một phẩy bảy ba carat, màu E, VS1, giá sáu triệu rưỡi. Cờ R3 tắt vì danh sách không còn viên Tự nhiên GIA. Trên biểu đồ, các điểm viền trắng nhảy từ cụm màu vàng sang cụm màu xanh.

Về mặt mô hình, khi bật tuỳ chọn này, trọng số của người dùng được trộn sáu mươi bốn mươi với một vector thiên về môi trường, làm trọng số môi trường tăng từ không phẩy mười tám lên không phẩy hai chín. Chỉ thay đổi đó đủ để lật kết quả, vì LGD có điểm môi trường cao hơn hẳn.

*[Chuột chỉ hai thẻ "Tác động môi trường" phía trên biểu đồ.]*

Hai thẻ này giải thích cơ sở: khai thác mỏ xáo trộn từ một trăm đến hai trăm năm mươi mét vuông đất mỗi carat, LGD gần như bằng không. Riêng phát thải carbon còn tranh cãi vì phụ thuộc nguồn điện, nên nhóm chỉ hiển thị tham khảo chứ không đưa vào điểm số.

---

## PHẦN 8 · KẾT — 4:30 đến 5:00

*[Bỏ tick eco. Kéo slider ngân sách qua trái rồi qua phải hai lần, để bảng và biểu đồ nhảy theo.]*

Tóm lại, mọi thứ trên trang cập nhật theo thời gian thực, và mọi khuyến nghị đều truy được về đúng bước và đúng luật tạo ra nó. Mô hình hoàn toàn tất định và minh bạch: cùng một đầu vào luôn cho cùng một kết quả, không có hộp đen.

Hạn chế hiện tại của nhóm là tỷ lệ giữ giá đang là giả định chuyên gia áp đồng loạt, và giá chưa bao gồm phần vỏ trang sức. Hướng phát triển là thu thập dữ liệu giao dịch bán lại thực tế, và thử thêm các phương pháp đa tiêu chí khác như AHP và TOPSIS để so sánh với WSM.

Em xin hết phần demo. Cảm ơn thầy và các bạn đã theo dõi.

---

## PHỤ LỤC · Bảng nhập liệu để dán cạnh màn hình

| Phần | Nút mục đích | Ngân sách | Carat | Màu | Độ trong | Eco |
| --- | --- | --- | --- | --- | --- | --- |
| 1, 2 | (mặc định) | 60000000 | 0.5 | D–F | FL–VS2 | tắt |
| 3 · R1 | Nhẫn cưới | 25000000 | 1 | D–J | FL–SI2 | tắt |
| 4 · R4+R3 | Nhẫn cưới | 120000000 | 1.2 | D–J | FL–VS2 | tắt |
| 5 · R3 | Tích trữ | 150000000 | 0.5 | D–F | FL–VS2 | tắt |
| 6 · R2 | Nhẫn cưới | 800000000 | 2 | D–F | FL–VS2 | tắt |
| 7 · Eco | Quà tặng / Cá nhân | 120000000 | 0.5 | D–F | FL–VS2 | tắt → bật |

Con số phải đọc đúng: 763 · 5 cửa hàng · 645 · 118 · 0,96 ct · 4,93 ct · 29,9 triệu · 48 triệu · 1,73 ct · 6,5 triệu · 1,22 ct H · 108 triệu · 678 triệu · 337 triệu/ct · 0,18 → 0,29.

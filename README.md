# Kính Lúp Kim Cương — Decision Support System

Hệ thống hỗ trợ ra quyết định chọn mua kim cương. Ứng dụng Next.js 16 chạy hoàn toàn phía client (không cần backend): trình duyệt tự đọc `public/data_ready.xlsx` khi mở trang.

## Cách chạy

Cần Node.js ≥ 20.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

Build production:

```bash
npm run build
npm run start
```

## Kiểm thử

| Lệnh                 | Nội dung                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| `npm test`         | Unit test (Vitest): engine 3 bước, 5 use case golden trên `data_ready.xlsx`, loader xlsx, store |
| `npm run test:e2e` | End-to-end (Playwright): 5 use case demo chạy qua giao diện thật + smoke test           |
| `npm run test:all` | Cả hai                                                                                |
| `npm run typecheck`| TypeScript                                                                            |
| `npm run lint`     | ESLint                                                                                |
| `npm run fsd`      | Kiểm tra kiến trúc Feature-Sliced Design (steiger)                                    |

Lần đầu chạy e2e cần tải trình duyệt: `npx playwright install chromium`.

## Kiến trúc — Feature-Sliced Design

Next.js chỉ dùng thư mục `app/` ở gốc làm router (re-export mỏng). Toàn bộ mã nguồn nằm trong `src/` theo các layer FSD; layer `pages` của FSD được đặt tên `views` vì Next.js sẽ coi `src/pages` là Pages Router.

```
app/                    # Next.js router: layout.tsx (font, CSS), page.tsx → views/diamond-dss
public/data_ready.xlsx  # dữ liệu đầu vào, đọc lúc chạy
src/
├── app/                # FSD app layer: globals.css (token màu + shadcn), fonts
├── views/diamond-dss   # trang duy nhất: nạp dữ liệu, gọi compute(), xếp các widget
├── widgets/            # từng khối giao diện
│   ├── masthead            tiêu đề + số liệu tập dữ liệu
│   ├── criteria-sidebar    ngân sách, carat, mục đích, 4 trọng số, eco, màu, độ trong
│   ├── recommendation-banner  kết luận Tự nhiên / LGD + các cờ [R1–R4]
│   ├── tradeoff-cards      so sánh phương án Tự nhiên vs LGD
│   ├── environment-impact  bảng tác động môi trường (tĩnh)
│   ├── market-loupe        biểu đồ SVG carat × giá (log)
│   ├── results-table       Top 5 đề xuất
│   └── app-footer
├── features/
│   ├── rank-diamonds       ENGINE: hard-filter.ts → wsm.ts → rules.ts (R1–R4) → compute.ts
│   └── configure-criteria  store zustand cho mọi thứ người dùng chỉnh
├── entities/
│   ├── diamond             kiểu Diamond, bảng mã, buildMeta, loader xlsx (JSZip + DOMParser)
│   └── criteria            kiểu Criteria, Purpose, PRESETS, giá trị mặc định
└── shared/
    ├── ui                  shadcn/ui (slider, select, table, …) + paired-number-input, field
    └── lib                 fmtVND, fmtTrieu, normalize, cn
e2e/                    # Playwright specs + page object
```

Quy tắc import: chỉ đi xuống `views → widgets → features → entities → shared`, mỗi slice chỉ lộ ra qua `index.ts`. `npm run fsd` kiểm tra tự động.

Giao diện: Tailwind CSS v4 + shadcn/ui. Bảng màu gốc được ánh xạ vào biến CSS của shadcn trong `src/app/styles/globals.css`.

## Cập nhật dữ liệu

Thay `public/data_ready.xlsx` bằng file mới (giữ nguyên cấu trúc cột, sheet tên `data_ready`) rồi tải lại trang. Không cần build lại. Mọi khoảng slider, option màu / độ trong, số liệu masthead và footer đều suy ra từ dữ liệu.

## Thuật toán

Hàm `compute(criteria, data)` trong `src/features/rank-diamonds/model/compute.ts` là hàm thuần (không phụ thuộc DOM), gồm 3 bước:

1. **Hard Filter** (`hard-filter.ts`) — loại viên vượt ngân sách, nhỏ hơn carat tối thiểu, hoặc không đạt chuẩn màu / độ trong.
2. **Weighted Scoring Model** (`wsm.ts`) — chuẩn hóa 4 tiêu chí về `[0, 1]` rồi tính `score = w1·Size + w2·Finance + w3·Quality + w4·Environment` theo trọng số người dùng nhập (`eco-blend.ts` pha trộn 60/40 khi bật ưu tiên môi trường).
3. **Rule-based Override** (`rules.ts`) — áp dụng 4 quy tắc nghiệp vụ R1–R4 (ưu tiên LGD khi không còn phương án Tự nhiên, nhãn "giá cao", ưu tiên GIA ở phân khúc cao cấp, điều chỉnh theo mục đích). Ngưỡng nằm trong `config/rules.ts`.

## 5 use cases demo

> Mỗi expected value bên dưới được xác minh bằng unit test (`golden-use-cases.test.ts`) và e2e test (`e2e/use-cases.spec.ts`) chạy trên `data_ready.xlsx` (763 viên · 645 Tự nhiên · 118 LGD).

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
- Talking point trung thực: banner ghi đè `[R4]` chỉ bật khi LGD dẫn đầu và Natural gần nhất chênh ≤ 0.10 trên cả 3 tiêu chí size/finance/quality; trên `data_ready.xlsx` khoảng cách tối thiểu ≈ 1.0 nên banner không kích hoạt với dữ liệu thật — điều kiện này được xác minh bằng unit test dữ liệu giả lập (`compute.test.ts`).

> Demo tip: nhấn lại nút mục đích trước mỗi use case để nạp đúng preset trọng số (giá trị khởi tạo của slider là 4/2/3/1, khác preset `Nhẫn cưới` 3/2/4/1 — giữ nguyên hành vi bản gốc). Chạy lần lượt UC1 → UC5, chụp lại Top 5 + các cờ `[R…]` sau mỗi bước; UC5 nhớ chụp cả 2 trạng thái của nút "Ưu tiên thân thiện môi trường".

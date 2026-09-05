import { Card } from "@/shared/ui/card";
import { Caption, SectionTitle } from "@/shared/ui/field";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-line py-[7px] text-[12.5px]">
      <span className="text-ink-faint">{label}</span>
      <b className="font-mono font-medium text-ink">{value}</b>
    </div>
  );
}

const badge =
  "mb-3 inline-block rounded-[20px] border px-2 py-[2px] font-mono text-[10.5px]";

/** Static per-carat environmental footprint comparison (industry LCA averages). */
export function EnvironmentImpact() {
  return (
    <section className="mb-5">
      <SectionTitle className="mb-1.5">Tác động môi trường ước tính (theo carat)</SectionTitle>
      <Caption className="pb-[14px]">
        Số liệu tổng hợp từ các nghiên cứu vòng đời sản phẩm (LCA) và báo cáo ngành trang sức —
        mang tính ước tính tham khảo trung bình ngành, không đo trực tiếp trên từng sản phẩm
        trong dữ liệu.
      </Caption>
      <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
        <Card className="gap-0 rounded-[2px] border-line bg-panel p-5 shadow-none">
          <span className={`${badge} border-gold/40 bg-gold/12 text-gold`}>Tự nhiên (khai thác mỏ)</span>
          <Metric label="Đất bị xáo trộn" value="100–250 m²/ct" />
          <Metric label="Nước tiêu thụ" value="480–750 lít/ct" />
          <Metric label="Phát thải KNK" value="57–160 kg CO₂e/ct" />
          <div className="mt-[10px] text-[11.5px] leading-[1.55] text-ink-faint">
            Khai thác mỏ làm xáo trộn diện tích đất lớn và tiêu thụ nhiều nước; mức độ có thể giảm
            nếu mỏ áp dụng phục hồi đất và quản lý bền vững.
          </div>
        </Card>
        <Card className="gap-0 rounded-[2px] border-line bg-panel p-5 shadow-none">
          <span className={`${badge} border-teal/40 bg-teal/12 text-teal`}>Nhân tạo (LGD)</span>
          <Metric label="Đất bị xáo trộn" value="0–1 m²/ct" />
          <Metric label="Nước tiêu thụ" value="50–80 lít/ct" />
          <Metric label="Phát thải KNK" value="15–480 kg CO₂e/ct" />
          <div className="mt-[10px] text-[11.5px] leading-[1.55] text-ink-faint">
            Đất và nước tiêu thụ thấp hơn rõ rệt so với khai thác mỏ. Riêng phát thải carbon{" "}
            <b className="text-ink">phụ thuộc nguồn điện sản xuất</b>: dùng năng lượng tái tạo có
            thể thấp hơn nhiều so với Tự nhiên, nhưng dùng lưới điện từ than (phổ biến ở một số cơ
            sở tại Trung Quốc, Ấn Độ) có thể cao hơn — đây là điểm còn tranh luận trong ngành.
          </div>
        </Card>
      </div>
    </section>
  );
}

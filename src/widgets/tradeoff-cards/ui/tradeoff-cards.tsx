import { OriginDot, type Diamond, type DiamondOrigin } from "@/entities/diamond";
import { fmtVND } from "@/shared/lib";
import { Card } from "@/shared/ui/card";
import { SectionTitle } from "@/shared/ui/field";

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-t border-line py-[7px] text-[12.5px]">
      <span className="text-ink-faint">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}

function OptionCard({ origin, title, list }: { origin: DiamondOrigin; title: string; list: Diamond[] }) {
  const best = list.length ? list.reduce((a, b) => (b.carat > a.carat ? b : a)) : null;
  const avgResale = list.length
    ? list.reduce((s, d) => s + (d.resale ?? 0), 0) / list.length
    : 0;

  return (
    <Card className="gap-0 rounded-[2px] border-line bg-panel p-5 shadow-none">
      <div className="mb-4 flex items-center gap-2">
        <OriginDot origin={origin} />
        <SectionTitle>{title}</SectionTitle>
      </div>
      {!best ? (
        <div className="text-[12.5px] italic text-ink-faint">
          Không có lựa chọn phù hợp trong ngân sách / bộ lọc hiện tại.
        </div>
      ) : (
        <>
          <div
            className={`my-[2px] font-serif text-[32px] ${origin === "natural" ? "text-gold" : "text-teal"}`}
          >
            {best.carat.toFixed(2)} ct
          </div>
          <div className="mb-[14px] text-[12px] text-ink-faint">
            Carat lớn nhất khả dụng trong ngân sách
          </div>
          <KV label="Giá viên carat lớn nhất" value={`${fmtVND(best.price)} đ`} />
          <KV label="Giá trị thu hồi ước tính" value={`${fmtVND(best.price * (best.resale ?? 0))} đ`} />
          <KV label="Tỷ lệ giữ giá trung bình" value={`${(avgResale * 100).toFixed(0)}%`} />
          <KV label="Số lựa chọn khớp" value={list.length} />
        </>
      )}
    </Card>
  );
}

/** Two side-by-side summaries: best natural vs best LGD option within the current filter. */
export function TradeoffCards({ filtered }: { filtered: Diamond[] }) {
  const nat = filtered.filter((d) => d.origin === "natural");
  const lgd = filtered.filter((d) => d.origin === "lgd");
  return (
    <div className="mb-5 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
      <OptionCard origin="natural" title="Phương án Tự nhiên" list={nat} />
      <OptionCard origin="lgd" title="Phương án Nhân tạo (LGD)" list={lgd} />
    </div>
  );
}

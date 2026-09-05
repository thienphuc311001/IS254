import { resalePct, type DatasetMeta } from "@/entities/diamond";
import type { RankingResult, RuleLevel } from "@/features/rank-diamonds";
import { cn } from "@/shared/lib";

const FLAG_CLASS: Record<RuleLevel, string> = {
  override:
    "mt-[14px] border-coral/40 bg-coral/12 px-[10px] py-[5px] text-coral",
  warn: "mt-2 mr-1.5 border-amber/35 bg-amber/10 px-[9px] py-1 text-amber",
  info: "mt-2 mr-1.5 border-teal/30 bg-teal/8 px-[9px] py-1 text-teal",
};

function BannerFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "relative mb-5 overflow-hidden rounded-[2px] border border-line bg-gradient-to-br from-panel to-panel-2 p-[26px]",
        className,
      )}
    >
      {/* decorative rings, same as legacy ::before / ::after */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[40%] -right-[10%] size-[260px] rounded-full border border-line opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[15%] right-[5%] size-[150px] rounded-full border border-line opacity-50"
      />
      {children}
    </section>
  );
}

/** Headline verdict (Natural / LGD / none), explanation, fired rule flags, and eco banner. */
export function RecommendationBanner({
  result,
  meta,
}: {
  result: RankingResult;
  meta: DatasetMeta;
}) {
  const { filtered, top5, override, ecoPreferred, ecoOverride, flags } = result;

  let verdict: { title: string; tone: "none" | "natural" | "lgd"; text: string };
  if (!filtered.length) {
    verdict = {
      title: "Chưa có kết quả",
      tone: "none",
      text: "Không có viên kim cương nào khớp với ngân sách và tiêu chí hiện tại. Hãy tăng ngân sách hoặc nới lỏng carat / màu / độ trong.",
    };
  } else {
    const natCount = top5.filter((d) => d.origin === "natural").length;
    const lgdCount = top5.length - natCount;
    const leanLgd = lgdCount > natCount || override;
    verdict = leanLgd
      ? {
          title: "Kim cương Nhân tạo (LGD)",
          tone: "lgd",
          text: `Với mức ưu tiên và ngân sách hiện tại, LGD mang lại carat lớn hơn đáng kể trên cùng chi phí. Đánh đổi: khả năng giữ giá thấp hơn (~${resalePct(meta, "lgd")}% so với ${resalePct(meta, "natural")}%).`,
        }
      : {
          title: "Kim cương Tự nhiên",
          tone: "natural",
          text: "Với mức ưu tiên và ngân sách hiện tại, kim cương Tự nhiên (chứng nhận GIA) là lựa chọn tối ưu nhờ khả năng giữ giá trị tài sản cao và tính thanh khoản tốt hơn.",
        };
  }

  return (
    <>
      <BannerFrame>
        <div className="mb-[10px] font-mono text-[11px] uppercase tracking-[.12em] text-ink-faint">
          Khuyến nghị của hệ thống
        </div>
        <h2
          className={cn(
            "relative z-[1] m-0 mb-[10px] font-serif text-[29px] font-medium",
            verdict.tone === "natural" && "text-gold",
            verdict.tone === "lgd" && "text-teal",
          )}
        >
          {verdict.title}
        </h2>
        <p className="relative z-[1] m-0 max-w-[640px] text-[13.5px] text-ink-dim">{verdict.text}</p>
        <div>
          {flags.map((f) => (
            <span
              key={`${f.id}-${f.level}`}
              className={cn(
                "relative z-[1] inline-block rounded-[2px] border font-mono text-[11px]",
                FLAG_CLASS[f.level],
              )}
            >
              [{f.id}] {f.msg}
            </span>
          ))}
        </div>
      </BannerFrame>

      {ecoPreferred && ecoOverride && (
        <BannerFrame className="border-teal/45">
          <div className="mb-[10px] font-mono text-[11px] uppercase tracking-[.12em] text-ink-faint">
            Eco override · R4
          </div>
          <p className="relative z-[1] m-0 max-w-[640px] text-[13.5px] text-teal">
            Đã ưu tiên kim cương nhân tạo vì tương đương chất lượng, thân thiện môi trường hơn.
          </p>
        </BannerFrame>
      )}
    </>
  );
}

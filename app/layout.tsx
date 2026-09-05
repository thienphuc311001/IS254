import type { Metadata } from "next";
import "@/app/styles/globals.css";
import { fontClassNames } from "@/app";
import { TooltipProvider } from "@/shared/ui/tooltip";

export const metadata: Metadata = {
  title: "DSS Diamond",
  description: "Hệ thống hỗ trợ ra quyết định chọn mua kim cương",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={fontClassNames}>
      <body>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}

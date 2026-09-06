"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

/**
 * Next.js App Router error boundary for the page segment. Renders instead of a blank
 * screen when a client component throws, and offers a retry.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-7xl px-7 pt-9 pb-20">
      <div className="mb-2 font-mono text-xs uppercase tracking-widest text-coral">
        Đã xảy ra lỗi
      </div>
      <h1 className="m-0 font-serif text-3xl font-medium text-ink">Không thể hiển thị trang</h1>
      <p className="mt-2.5 max-w-2xl text-sm text-ink-dim">
        {error.message || "Lỗi không xác định."} Hãy tải lại trang hoặc thử lại bên dưới.
      </p>
      <Button
        onClick={reset}
        variant="outline"
        className="mt-5 rounded-xs border-line font-mono text-xs text-ink hover:border-gold hover:text-gold"
      >
        Thử lại
      </Button>
    </main>
  );
}

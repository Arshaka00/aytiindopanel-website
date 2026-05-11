import { NextResponse, type NextRequest } from "next/server";

import { getSiteContentVersionToken } from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel serverless memotong eksekusi panjang (~300s). Stream SSE tanpa akhir memicu
 * "Runtime Timeout Error". Tutup koneksi lebih dulu; browser EventSource menyambung lagi
 * (lihat `SiteContentAutoRefresh`).
 */
function streamMaxMs(): number {
  const raw = Number(process.env.SITE_CONTENT_STREAM_MAX_MS);
  const parsed = Number.isFinite(raw) && raw > 10_000 ? raw : 240_000;
  return Math.min(parsed, 290_000);
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const startedAt = Date.now();
  const maxMs = streamMaxMs();

  const shutdown = () => {
    if (closed) return;
    closed = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  req.signal.addEventListener("abort", shutdown);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        controller.enqueue(encoder.encode(`retry: 2500\n\n`));
      } catch {
        shutdown();
        return;
      }

      const push = async () => {
        if (closed) return;
        if (Date.now() - startedAt >= maxMs) {
          try {
            controller.close();
          } catch {
            /* noop */
          }
          shutdown();
          return;
        }
        const version = await getSiteContentVersionToken();
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: version\ndata: ${JSON.stringify({ version })}\n\n`));
        } catch {
          shutdown();
        }
      };
      void push();
      timer = setInterval(() => {
        void push();
      }, 2500);
    },
    cancel() {
      shutdown();
    },
  });

  const response = new NextResponse(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
  return response;
}

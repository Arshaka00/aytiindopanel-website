import { NextResponse } from "next/server";

import { getSiteContentVersionToken } from "@/lib/site-content";

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const push = async () => {
        if (closed) return;
        const version = await getSiteContentVersionToken();
        try {
          controller.enqueue(encoder.encode(`event: version\ndata: ${JSON.stringify({ version })}\n\n`));
        } catch {
          // Client already disconnected, stop pushing.
          closed = true;
          if (timer) clearInterval(timer);
        }
      };
      void push();
      timer = setInterval(() => {
        void push();
      }, 2500);
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
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

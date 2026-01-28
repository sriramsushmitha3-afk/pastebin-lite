import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

function getNow(req: NextRequest) {
  // Deterministic time for testing
  if (process.env.TEST_MODE === "1") {
    const header = req.headers.get("x-test-now-ms");
    if (header) {
      return new Date(Number(header));
    }
  }
  return new Date();
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
 const { id } = await context.params; 

  const key = `paste:${id}`;
  const raw = await kv.get<string>(key);
  if (!raw) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const paste = await kv.get<any>(key);

if (!paste) {
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

  const now = getNow(req);

  // TTL check
  if (paste.expires_at && new Date(paste.expires_at) <= now) {
    await kv.del(key);
    return new Response(JSON.stringify({ error: "Expired" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // View limit check
  if (paste.max_views !== null) {
    if (paste.views >= paste.max_views) {
      return new Response(JSON.stringify({ error: "View limit exceeded" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Increment views
  paste.views += 1;
  await kv.set(key, JSON.stringify(paste));

  const remainingViews =
    paste.max_views === null ? null : paste.max_views - paste.views;

  return new Response(
    JSON.stringify({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires_at ?? null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

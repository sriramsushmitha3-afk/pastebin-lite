import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.content || typeof body.content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const pasteId = randomUUID();
    const now = new Date();

const expiresAt =
  typeof body.ttl_seconds === "number"
    ? new Date(now.getTime() + body.ttl_seconds * 1000).toISOString()
    : null;

    // Prepare paste object
    const pasteData = {
      content: body.content,
      created_at: now.toISOString(),
      ttl_seconds: typeof body.ttl_seconds === "number" ? body.ttl_seconds : null,
      max_views: typeof body.max_views === "number" ? body.max_views : null,
      expires_at: expiresAt,
      views: 0,
    };

    // Only set TTL if ttl_seconds is provided
    const options: any = {};
    if (pasteData.ttl_seconds) options.ex = pasteData.ttl_seconds;

    await kv.set(`paste:${pasteId}`, JSON.stringify(pasteData), options);

    return new Response(
      JSON.stringify({
        id: pasteId,
url: `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/p/${pasteId}`,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

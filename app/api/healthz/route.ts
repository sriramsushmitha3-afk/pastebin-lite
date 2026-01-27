import { kv } from "@vercel/kv";

export async function GET() {
  try {
    await kv.get("healthcheck");
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 });
  }
}

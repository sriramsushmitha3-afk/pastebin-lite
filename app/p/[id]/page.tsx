import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  const paste = await kv.get<any>(`paste:${id}`);

  if (!paste) {
    notFound();
  }

  // Safety: render as plain text
  return (
    <main style={{ padding: "20px", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
      {paste.content}
    </main>
  );
}

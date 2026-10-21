import clientPromise from "@/lib/db";
import { getUser } from "@/lib/auth";
export async function PUT(req) {
  const u = await getUser();
  if (!u) return Response.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  await (await clientPromise).db().collection("users").updateOne({ _id: u._id }, { $set: { progress: { results: b.results || {}, cards: b.cards || {}, plan: b.plan || null } } });
  return Response.json({ ok: 1 });
}

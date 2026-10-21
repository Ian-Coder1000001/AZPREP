import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import clientPromise from "@/lib/db";
import { setSession, getUser } from "@/lib/auth";
const pub = (u) => ({ user: { name: u.name, email: u.email }, progress: u.progress || {} });
export async function GET() {
  const u = await getUser();
  return Response.json(u ? pub(u) : {});
}
export async function POST(req, { params }) {
  if (params.action === "logout") { cookies().delete("s"); return Response.json({ ok: 1 }); }
  const { email = "", password = "", name = "" } = await req.json();
  const e = email.trim().toLowerCase();
  if (!e || password.length < 6) return Response.json({ error: "Enter an email and a password of 6+ characters." }, { status: 400 });
  const users = (await clientPromise).db().collection("users");
  let u;
  if (params.action === "register") {
    if (await users.findOne({ email: e })) return Response.json({ error: "That email is already registered. Log in instead." }, { status: 409 });
    const r = await users.insertOne({ email: e, name: name || e.split("@")[0], hash: await bcrypt.hash(password, 10), progress: {} });
    u = await users.findOne({ _id: r.insertedId });
  } else {
    u = await users.findOne({ email: e });
    if (!u || !(await bcrypt.compare(password, u.hash))) return Response.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await setSession(u._id.toString());
  return Response.json(pub(u));
}

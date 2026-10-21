import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "./db";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export async function setSession(id) {
  const t = await new SignJWT({ id }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(key());
  cookies().set("s", t, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
}
export async function getUser() {
  try {
    const t = cookies().get("s")?.value;
    if (!t) return null;
    const { payload } = await jwtVerify(t, key());
    return await (await clientPromise).db().collection("users").findOne({ _id: new ObjectId(payload.id) });
  } catch { return null; }
}

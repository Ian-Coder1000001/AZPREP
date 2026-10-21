import { getUser } from "@/lib/auth";
export async function POST(req) {
  if (!(await getUser())) return Response.json({ error: "login" }, { status: 401 });
  const { messages = [], lang = "English" } = await req.json();
  const system = `You are AZPREP Study Buddy, an UNOFFICIAL tutor for Microsoft AZ-900 (Azure Fundamentals) learners, many in Africa.
Reply in simple ${lang} for a beginner. Format: (1) one-sentence plain definition, (2) a real-life African analogy (M-Pesa or mobile money, Jumia, matatus, data bundles, a market stall, a bank branch), (3) "Exam tip:" one line on how AZ-900 tests it.
Maximum 150 words. Spell out every abbreviation the first time. Stay on AZ-900 and cloud basics; if unsure, say so instead of guessing. Never claim to be official Microsoft material.`;
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", temperature: 0.4, max_tokens: 500, messages: [{ role: "system", content: system }, ...messages.slice(-8)] }),
  });
  const d = await r.json();
  return Response.json({ reply: d.choices?.[0]?.message?.content || "The AI is busy. Try again in a moment." });
}

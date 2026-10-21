"use client";
import { useEffect, useState } from "react";
import { TOPICS as T, QUESTIONS as Q, CARDS as C } from "@/lib/data";
const api = (u, m = "GET", b) => fetch(u, { method: m, headers: { "Content-Type": "application/json" }, body: b && JSON.stringify(b) }).then((r) => r.json());
const pc = (r) => (r && r[1] ? Math.round((100 * r[0]) / r[1]) : null);
const DAY = 864e5, GAP = [0, 1, 3, 7, 14, 30];
const blank = { results: {}, cards: {} };

export default function App() {
  const [user, setUser] = useState(null), [p, setP] = useState(blank), [tab, setTab] = useState("home"), [ok, setOk] = useState(false), [seed, setSeed] = useState("");
  const load = (d) => { setUser(d.user); setP({ ...blank, ...d.progress }); };
  useEffect(() => { api("/api/auth/me").then((d) => { if (d.user) load(d); setOk(true); }); }, []);
  const save = (n) => { setP(n); api("/api/progress", "PUT", n); };
  const ask = (t) => { setSeed(t); setTab("buddy"); };
  if (!ok) return <main className="c">Loading…</main>;
  if (!user) return <Auth onDone={load} />;
  const tabs = [["home", "Progress"], ["quiz", "Quiz"], ["cards", "Cards"], ["plan", "Plan"], ["buddy", "Buddy"]];
  return (
    <main className="c">
      <header>
        <h1>AZPREP</h1>
        <span className="tag">Unofficial AZ-900 study tool. Not affiliated with or endorsed by Microsoft. Practice questions are original.</span>
        <button className="ghost" onClick={async () => { await api("/api/auth/logout", "POST"); setUser(null); }}>Log out ({user.name})</button>
      </header>
      <nav>{tabs.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</nav>
      {tab === "home" && <Home p={p} go={setTab} />}
      {tab === "quiz" && <Quiz p={p} save={save} ask={ask} />}
      {tab === "cards" && <Cards p={p} save={save} />}
      {tab === "plan" && <Plan p={p} save={save} />}
      {tab === "buddy" && <Buddy seed={seed} clear={() => setSeed("")} />}
    </main>
  );
}

function Auth({ onDone }) {
  const [m, setM] = useState("register"), [f, setF] = useState({}), [e, setE] = useState("");
  const set = (k) => (x) => setF({ ...f, [k]: x.target.value });
  const go = async () => { const d = await api("/api/auth/" + m, "POST", f); d.error ? setE(d.error) : onDone(d); };
  return (
    <main className="c auth">
      <h1>AZPREP</h1>
      <p className="lead">Pass Azure Fundamentals (AZ-900) with quizzes that explain every answer, flashcards that return what you forget, a plan built around your exam date, and an AI buddy that uses everyday African examples.</p>
      {m === "register" && <input placeholder="Your name" onChange={set("name")} />}
      <input placeholder="Email" type="email" onChange={set("email")} />
      <input placeholder="Password (6+ characters)" type="password" onChange={set("password")} />
      {e && <p className="err">{e}</p>}
      <button className="big" onClick={go}>{m === "login" ? "Log in" : "Create free account"}</button>
      <button className="ghost" onClick={() => { setM(m === "login" ? "register" : "login"); setE(""); }}>{m === "login" ? "New here? Create an account" : "Have an account? Log in"}</button>
      <p><small>Unofficial study tool. Not affiliated with Microsoft.</small></p>
    </main>
  );
}

function Home({ p, go }) {
  const rows = T.map((t, i) => [t, pc(p.results[i]), p.results[i]?.[1] || 0]);
  const done = rows.filter((r) => r[1] !== null), tot = rows.reduce((s, r) => s + r[2], 0);
  const avg = done.length ? Math.round(done.reduce((s, r) => s + r[1], 0) / done.length) : 0;
  const msg = tot < 20 ? "Answer at least 20 questions for a reliable reading." : avg >= 75 && done.length === T.length ? "You look ready. Book the exam." : avg >= 60 ? "Getting close. Drill the red and amber topics." : "Keep revising. Start with your weakest topic.";
  return (
    <section>
      <div className="score"><div className="ring" style={{ "--v": avg }}><b>{avg}%</b></div><div><h2>Exam readiness</h2><p>{msg}</p><small>{tot} questions answered</small></div></div>
      {rows.map(([t, v, n]) => (
        <div key={t} className="row"><span>{t}</span>
          <div className="bar"><i style={{ width: (v || 0) + "%", background: v >= 75 ? "#22c55e" : v >= 50 ? "#f59e0b" : "#ef4444" }} /></div>
          <em>{v === null ? "not tried" : v + "%"} ({n})</em></div>
      ))}
      <button className="big" onClick={() => go("quiz")}>Practise now</button>
    </section>
  );
}

function Quiz({ p, save, ask }) {
  const [t, setT] = useState(-1), [qs, setQs] = useState(null), [i, setI] = useState(0), [pick, setPick] = useState(null), [s, setS] = useState(0);
  const start = () => { setQs(Q.filter((q) => t < 0 || q[0] === t).sort(() => Math.random() - 0.5).slice(0, 10)); setI(0); setPick(null); setS(0); };
  if (!qs) return (
    <section><h2>What do you want to practise?</h2><p>10 random questions per round, drawn from {Q.length} in the bank. Pick a topic:</p>
      <div className="chips">{[-1, ...T.keys()].map((k) => <button key={k} className={"chip" + (t === k ? " on" : "")} onClick={() => setT(k)}>{k < 0 ? "Mixed" : T[k]} <small>{Q.filter((q) => k < 0 || q[0] === k).length}</small></button>)}</div>
      <button className="big" onClick={start}>Start quiz</button></section>
  );
  if (i >= qs.length) return <section><h2>You scored {s} out of {qs.length}</h2><button className="big" onClick={() => setQs(null)}>Another round</button></section>;
  const q = qs[i];
  const choose = (k) => {
    if (pick !== null) return;
    setPick(k);
    const r = p.results[q[0]] || [0, 0], hit = k === q[3] ? 1 : 0;
    save({ ...p, results: { ...p.results, [q[0]]: [r[0] + hit, r[1] + 1] } });
    setS(s + hit);
  };
  return (
    <section><div className="prog"><i style={{ width: (i / qs.length) * 100 + "%" }} /></div><small>{T[q[0]]} · question {i + 1} of {qs.length}</small><h2>{q[1]}</h2>
      {q[2].map((o, k) => <button key={k} className={"opt " + (pick !== null ? (k === q[3] ? "good" : k === pick ? "bad" : "") : "")} onClick={() => choose(k)}>{o}</button>)}
      {pick !== null && (
        <div className="exp"><b>{pick === q[3] ? "Correct" : "Not quite"}</b><p>{q[4]}</p>
          <button className="ghost" onClick={() => ask("Explain simply: " + q[1] + " The correct answer is: " + q[2][q[3]])}>Explain it with an everyday example</button>
          <button className="big" onClick={() => { setI(i + 1); setPick(null); }}>Next question</button></div>
      )}
    </section>
  );
}

// function Cards({ p, save }) {
//   const [flip, setFlip] = useState(false), now = Date.now();
//   const due = C.map((c, i) => ({ c, i, s: p.cards[i] || { b: 0, d: 0 } })).filter((x) => x.s.d <= now).sort((a, b) => a.s.b - b.s.b);
//   const rate = (x, good) => { const b = good ? Math.min(x.s.b + 1, 5) : 0; save({ ...p, cards: { ...p.cards, [x.i]: { b, d: good ? now + GAP[b] * DAY : now + 3e4 } } }); setFlip(false); };
//   if (!due.length) return <section><h2>All caught up</h2><p>Cards you missed come back soon; cards you know return after longer gaps. Take a quiz while you wait.</p></section>;
//   const x = due[0];
//   return (
//     <section><small>{T[x.c[0]]} · {due.length} due · box {x.s.b + 1} of 6</small>
//       <div className={"card" + (flip ? " back" : "")} onClick={() => setFlip(!flip)}>{flip ? x.c[2] : x.c[1]}</div>
//       <small>{flip ? "How did you do?" : "Tap the card to see the answer"}</small>
//       {flip && <div className="two"><button className="bad" onClick={() => rate(x, 0)}>Again</button><button className="good" onClick={() => rate(x, 1)}>Got it</button></div>}
//     </section>
//   );
// }

// function Plan({ p, save }) {
//   const [d, setD] = useState(p.plan?.d || ""), [h, setH] = useState(p.plan?.h || 6), [out, setOut] = useState(null);
//   const make = () => {
//     const days = Math.ceil((new Date(d) - Date.now()) / DAY);
//     if (!(days > 0)) return setOut("Pick an exam date in the future.");
//     const weeks = Math.max(1, Math.ceil(days / 7)), total = weeks * h;
//     const w = T.map((t, i) => ({ t, i, w: 1.3 - (pc(p.results[i]) ?? 0) / 100 })).sort((a, b) => b.w - a.w), sum = w.reduce((s, x) => s + x.w, 0);
//     setOut({ days, weeks, lines: w.map((x) => `${x.t}: ${((total * 0.85 * x.w) / sum).toFixed(1)} hours ` + (pc(p.results[x.i]) === null ? "(not tested yet)" : `(your score ${pc(p.results[x.i])}%)`)),
//       wk: Array.from({ length: weeks }, (_, k) => (k === weeks - 1 && weeks > 1 ? `Week ${weeks}: mixed quizzes, flashcards, then rest.` : `Week ${k + 1}: focus on ${w[k % w.length].t}, then ${w[(k + 1) % w.length].t}.`)) });
//     save({ ...p, plan: { d, h } });
//   };
//   return (
//     <section><h2>Build your plan</h2>
//       <label>Exam date<input type="date" value={d} onChange={(e) => setD(e.target.value)} /></label>
//       <label>Study hours per week<input type="number" min="1" max="40" value={h} onChange={(e) => setH(+e.target.value)} /></label>
//       <button className="big" onClick={make}>Create my plan</button>
//       {typeof out === "string" && <p className="err">{out}</p>}
//       {out && typeof out === "object" && (<div><p>{out.days} days left, about {out.weeks} weeks. Weak topics get the most time; 15% is kept for revision.</p>
//         <ul>{out.lines.map((l) => <li key={l}>{l}</li>)}</ul><h3>Week by week</h3><ul>{out.wk.map((l) => <li key={l}>{l}</li>)}</ul></div>)}
//     </section>
//   );
// }

function Buddy({ seed, clear }) {
  const [m, setM] = useState([]), [t, setT] = useState(""), [lang, setL] = useState("English"), [busy, setB] = useState(false);
  const send = async (text) => {
    if (!text.trim() || busy) return;
    const n = [...m, { role: "user", content: text }]; setM(n); setT(""); setB(true);
    const d = await api("/api/chat", "POST", { messages: n, lang });
    setM([...n, { role: "assistant", content: d.reply || "Please log in again." }]); setB(false);
  };
  useEffect(() => { if (seed) { send(seed); clear(); } }, [seed]);
  return (
    <section><h2>Study Buddy</h2>
      <select value={lang} onChange={(e) => setL(e.target.value)}>{["English", "Swahili", "Hausa", "Yoruba", "Zulu", "French"].map((x) => <option key={x}>{x}</option>)}</select>
      {!m.length && <p>Ask anything, for example: "What is a resource group?" or "Why is ExpressRoute better than a VPN?"</p>}
      {m.map((x, k) => <div key={k} className={"msg " + (x.role === "user" ? "u" : "a")}>{x.content}</div>)}
      {busy && <p>Thinking…</p>}
      <input value={t} placeholder="Type your question" onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(t)} />
      <button className="big" onClick={() => send(t)}>Ask</button>
    </section>
  );
}

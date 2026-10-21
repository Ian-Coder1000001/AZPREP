import { RQ, RC } from "./content/starter";
import { D1 } from "./content/cloud-concepts";
import { D2 } from "./content/azure-architecture";
import { D3 } from "./content/management-governance";
import { N1 } from "./content/more-cloud";
import { N2 } from "./content/more-arch";
import { N3 } from "./content/more-gov";
// The three AZ-900 exam domains (Microsoft Learn paths)
export const TOPICS = ["Cloud Concepts", "Azure Architecture & Services", "Management & Governance"];
const M = [0, 1, 1, 1, 1, 2]; // starter sub-topics -> domains
const mk = (d) => (r) => [d, r[0], [r[1], r[2], r[3]], 0, r[4]]; // compact rows: correct answer first
const shuf = ([t, q, o, a, e]) => { const i = o.map((_, k) => k).sort(() => Math.random() - 0.5); return [t, q, i.map((k) => o[k]), i.indexOf(a), e]; };
export const QUESTIONS = [...RQ.map(([t, ...r]) => [M[t], ...r]), ...D1, ...D2, ...D3, ...N1.map(mk(0)), ...N2.map(mk(1)), ...N3.map(mk(2))].map(shuf);
export const CARDS = RC.map(([t, ...r]) => [M[t], ...r]);

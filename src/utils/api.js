import { SB, SH } from './constants';

export async function sbG(t, q = "") {
  const r = await fetch(`${SB}/rest/v1/${t}?${q}`, { headers: SH });
  return r.json();
}

export async function sbP(t, d) {
  const r = await fetch(`${SB}/rest/v1/${t}`, {
    method: "POST",
    headers: SH,
    body: JSON.stringify(d)
  });
  return r.json();
}

export async function sbU(t, d) {
  const r = await fetch(`${SB}/rest/v1/${t}`, {
    method: "POST",
    headers: { ...SH, "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify(d)
  });
  const text = await r.text();
  return text ? JSON.parse(text) : d;
}

export async function sbPA(t, q, d) {
  const r = await fetch(`${SB}/rest/v1/${t}?${q}`, {
    method: "PATCH",
    headers: SH,
    body: JSON.stringify(d)
  });
  return r.json();
}
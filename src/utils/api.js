import { SB, SH } from '../constants';

export const sbG = async (t, q = "") => {
  const r = await fetch(`${SB}/rest/v1/${t}?${q}`, { headers: SH });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const sbP = async (t, d) => {
  const r = await fetch(`${SB}/rest/v1/${t}`, {
    method: "POST",
    headers: SH,
    body: JSON.stringify(Array.isArray(d) ? d : [d])
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const sbPA = async (t, q, d) => {
  const r = await fetch(`${SB}/rest/v1/${t}?${q}`, {
    method: "PATCH",
    headers: { ...SH, "Prefer": "return=representation" },
    body: JSON.stringify(d)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const sbU = async (t, d) => {
  const r = await fetch(`${SB}/rest/v1/${t}`, {
    method: "POST",
    headers: { ...SH, "Prefer": "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify(Array.isArray(d) ? d : [d])
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const sbD = async (t, q) => {
  const r = await fetch(`${SB}/rest/v1/${t}?${q}`, {
    method: "DELETE",
    headers: SH
  });
  if (!r.ok) throw new Error(await r.text());
  return true;
};

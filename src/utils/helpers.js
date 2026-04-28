export function mapKey(ck) {
  if (!ck) return null;
  const k = ck.toLowerCase().replace(/[\s_]+/g, "-");
  const M = {
    "creche": "Crèche", "crèche": "Crèche", "crache": "Crèche",
    "kg1": "KG1", "kg-1": "KG1", "kg2": "KG2", "kg-2": "KG2",
    "nursery1": "Nursery 1", "nursery-1": "Nursery 1", "nursery2": "Nursery 2", "nursery-2": "Nursery 2",
    "primary1": "Primary 1", "primary-1": "Primary 1",
    "primary2": "Primary 2", "primary-2": "Primary 2",
    "primary3": "Primary 3", "primary-3": "Primary 3",
    "primary4": "Primary 4", "primary-4": "Primary 4",
    "primary5": "Primary 5", "primary-5": "Primary 5",
    "jss1": "JSS1", "jss-1": "JSS1", "jss2": "JSS2", "jss-2": "JSS2", "jss3": "JSS3", "jss-3": "JSS3",
    "ss1": "SS1", "ss-1": "SS1", "ss2": "SS2", "ss-2": "SS2", "ss3": "SS3", "ss-3": "SS3"
  };
  if (M[k]) return M[k];
  const base = k.replace(/-(science|arts?|commercial|social|tech|general|vocational|basic|a|b|c)(\d*)$/i, "");
  return M[base] || M[base.replace(/-/g, "")] || null;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const today = () => new Date().toISOString().slice(0, 10);
export const fmtD = d => {
  if (!d) return "";
  const s = (d + "").slice(0, 10).split("-");
  return `${s[2]}/${s[1]}/${s[0]}`;
};
export const dayN = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
export const N = n => "₦" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const LS = {
  g: (k, f) => {
    try {
      const v = localStorage.getItem(k);
      return v !== null ? JSON.parse(v) : f;
    } catch {
      return f;
    }
  },
  s: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }
};

export const SS = {
  g: (k, f) => {
    try {
      const v = sessionStorage.getItem(k);
      return v !== null ? JSON.parse(v) : f;
    } catch {
      return f;
    }
  },
  s: (k, v) => {
    try {
      sessionStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }
};

export const hashPin = async (pin, salt) => {
  const d = new TextEncoder().encode(pin + ":" + salt + ":wts2025");
  const b = await crypto.subtle.digest("SHA-256", d);
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
};

import { PROP_PIN_KEY, PROP_DEFAULT_PIN, PROP_USER } from '../constants';

export const checkPropPin = async (entered) => {
  const stored = LS.g(PROP_PIN_KEY, null);
  if (!stored) {
    const dh = await hashPin(PROP_DEFAULT_PIN, PROP_USER);
    const eh = await hashPin(entered, PROP_USER);
    return dh === eh;
  }
  const eh = await hashPin(entered, PROP_USER);
  return stored === eh;
};

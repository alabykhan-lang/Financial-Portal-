import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEF_CATS, ALL_CLS, SUPER_PASS } from '../constants';
import { N } from '../utils/helpers';

export default function Settings() {
  const ctx = useApp();
  const [cats, setCats] = useState(ctx.categories || DEF_CATS);
  const [newCat, setNewCat] = useState('');
  const [cfg, setCfg] = useState(ctx.termCfg || { term: '1st Term', year: '2024/2025' });
  const [prof, setProf] = useState(ctx.schoolProfile || {});
  const [aic, setAic] = useState(ctx.aiConfig || { apiKey: '', model: 'google/gemini-2.0-flash-001' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const ft = ctx.feeTargets || {};
  const updateFT = (cls, cat, val) => {
    const nft = { ...ft };
    if (!nft[cls]) nft[cls] = {};
    nft[cls][cat] = parseFloat(val) || 0;
    ctx.setFeeTargets(nft);
  };

  async function save() {
    setSaving(true);
    await ctx.saveAllSettings(cats, ft, cfg, aic, prof, aic);
    setSaving(false);
    setMsg('✓ Settings saved to cloud.');
    setTimeout(() => setMsg(null), 3000);
  }

  const handleWipe = () => {
    const p = prompt("DANGER: Enter Super Admin Password to wipe ALL data:");
    if (p === SUPER_PASS) ctx.wipeData();
    else if (p !== null) alert("Incorrect password.");
  };

  const handleWipeEntries = () => {
    const p = prompt("Enter Super Admin Password to wipe ONLY Cash Book entries:");
    if (p === SUPER_PASS) ctx.wipeEntries();
    else if (p !== null) alert("Incorrect password.");
  };

  return (
    <div className="fu">
      <div className="fb" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--ff-d)", fontSize: "1.15rem", color: "var(--navy)" }}>System Settings</h2>
        <button className="btn btn-save" onClick={save} disabled={saving}>{saving ? "Saving..." : "💾 SAVE ALL CHANGES"}</button>
      </div>
      {msg && <div className="msg-ok">{msg}</div>}

      <div className="card"><div className="sect">Academic Session</div>
        <div className="fr">
          <div className="fl"><span className="flb">Term</span><select value={cfg.term} onChange={e => setCfg({ ...cfg, term: e.target.value })} className="sel"><option>1st Term</option><option>2nd Term</option><option>3rd Term</option></select></div>
          <div className="fl"><span className="flb">Year</span><input value={cfg.year} onChange={e => setCfg({ ...cfg, year: e.target.value })} className="inp" placeholder="2024/2025" /></div>
        </div>
      </div>

      <div className="card"><div className="sect">Fee Categories</div>
        <div className="cp">{cats.map(c => <div key={c} className="pill a" style={{ cursor: "default", display: "flex", alignItems: "center", gap: 8 }}>{c} <span onClick={() => setCats(cats.filter(x => x !== c))} style={{ cursor: "pointer", opacity: .6 }}>✕</span></div>)}</div>
        <div className="fr" style={{ marginTop: 12 }}><input value={newCat} onChange={e => setNewCat(e.target.value)} className="inp" placeholder="New category name" style={{ maxWidth: 240 }} /><button className="btn btn-primary btn-sm" onClick={() => { if (newCat.trim()) { setCats([...cats, newCat.trim()]); setNewCat(''); } }}>Add</button></div>
      </div>

      <div className="card"><div className="sect">Fee Targets (₦)</div>
        <div className="tw" style={{ maxHeight: 400, overflowY: "auto" }}>
          <table><thead><tr><th>Class</th>{cats.filter(c => c !== "Outstanding/Backlog").map(c => <th key={c} className="r">{c}</th>)}</tr></thead>
            <tbody>{ALL_CLS.map(cls => <tr key={cls}><td><strong>{cls}</strong></td>{cats.filter(c => c !== "Outstanding/Backlog").map(cat => <td key={cat} className="r"><input type="number" value={ft[cls]?.[cat] || ""} onChange={e => updateFT(cls, cat, e.target.value)} className="li" style={{ width: 80, textAlign: "right" }} placeholder="0" /></td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ borderTop: "4px solid var(--red)" }}>
        <div className="sect" style={{ color: "var(--red)" }}>☢ Danger Zone</div>
        <p className="hint" style={{ marginBottom: 12 }}>These actions are irreversible and require the Super Admin password.</p>
        <div className="fr">
          <button className="btn btn-red" onClick={handleWipe}>WIPE ALL DATABASE DATA</button>
          <button className="btn btn-outline btn-red" onClick={handleWipeEntries} style={{ color: "var(--red)", borderColor: "var(--red)" }}>WIPE ONLY CASH BOOK ENTRIES</button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FEE_GROUPS, DEF_CATS } from '../constants';

export default function Settings(){
  const ctx=useApp();
  const[saving,setSaving]=useState(false);
  
  async function save(){
    setSaving(true);
    await ctx.saveAllSettings(ctx.categories,ctx.feeTargets,ctx.termCfg,ctx.lessonCur,ctx.schoolProfile,ctx.aiConfig);
    setSaving(false);
  }
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:16}}><h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem"}}>Settings</h2><button className="btn btn-save" onClick={save} disabled={saving}>{saving?"Saving…":"SAVE SETTINGS"}</button></div>
    <div className="card"><div className="sect">Academic Term</div><div className="fr"><input value={ctx.termCfg?.term||""} onChange={e=>ctx.setTermCfg({...ctx.termCfg,term:e.target.value})} className="inp"/><input value={ctx.termCfg?.year||""} onChange={e=>ctx.setTermCfg({...ctx.termCfg,year:e.target.value})} className="inp"/></div></div>
  </div>
  );
}

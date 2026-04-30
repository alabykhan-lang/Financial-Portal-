import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS, SCHOOL_NAME } from '../../constants';
import { N } from '../../utils/helpers';

export default function Analysis({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);
  const cats=(ctx.categories||DEF_CATS).filter(c=>c!=="Outstanding/Backlog");
  const[cat,setCat]=useState(cats[0]||"");
  const list=ctx.students[sc]||[];
  const classTargets=(ctx.feeTargets||{})[sc]||{};
  const target=classTargets[cat]||0;
  const sp=ctx.schoolProfile||{};
  const an=list.map(s=>{const p=(s.payments||[]).filter(x=>x.category===cat&&x.amount>0).reduce((sum,x)=>sum+x.amount,0);return{...s,paid:p,ok:target>0&&p>=target,owing:target>0?Math.max(0,target-p):0}});
  const totalR=an.reduce((s,a)=>s+a.paid,0);const pC=an.filter(a=>a.ok).length;const oC=an.filter(a=>!a.ok&&target>0).length;const tO=an.reduce((s,a)=>s+a.owing,0);
  
  function doPrint(){window.print()}
  function doPrintSection(sectionId){
    const allCards=document.querySelectorAll('.analysis-section');
    allCards.forEach(el=>{if(el.id!==sectionId)el.style.display='none'});
    window.print();
    allCards.forEach(el=>{el.style.display=''});
  }
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:14}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Payment Analysis — Section {sec}</h2>
      <button className="btn btn-gold btn-sm np" onClick={doPrint}>🖨 Print Full Report</button>
    </div>
    <div className="cp">{classes.map(c=><button key={c} className={"pill np"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c} ({(ctx.students[c]||[]).length})</button>)}</div>
    <div className="fr np" style={{marginBottom:14}}>
      <div className="fl" style={{flex:2}}><span className="flb">Category</span><select value={cat} onChange={e=>setCat(e.target.value)} className="sel">{cats.map(c=><option key={c}>{c}</option>)}</select></div>
      <div style={{fontFamily:"var(--ff-m)",fontSize:".76rem",padding:"8px 14px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:6,alignSelf:"flex-end",boxShadow:"var(--sh)",whiteSpace:"nowrap"}}>Target ({sc}): <strong style={{color:"var(--navy)"}}>{target>0?N(target):"Not set"}</strong></div>
    </div>
    <div className="po" style={{marginBottom:16,paddingBottom:12,borderBottom:"2px solid #000"}}>
      <div style={{fontFamily:"var(--ff-d)",fontSize:"1.2rem",fontWeight:700,textAlign:"center"}}>{sp.name||SCHOOL_NAME}</div>
      <div style={{textAlign:"center",fontSize:".72rem",color:"#555",marginTop:2}}>{sp.address}{sp.phone?" · Tel: "+sp.phone:""}</div>
      <div style={{textAlign:"center",fontSize:".82rem",fontWeight:600,marginTop:8}}>Payment Analysis Report — Section {sec}</div>
      <div style={{textAlign:"center",fontSize:".72rem",color:"#555",marginTop:2}}>Class: {sc} &nbsp;|&nbsp; Category: {cat} &nbsp;|&nbsp; Term: {ctx.termCfg?.term} {ctx.termCfg?.year} &nbsp;|&nbsp; Printed: {new Date().toLocaleString()}</div>
      <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:10,fontFamily:"monospace",fontSize:".8rem"}}>
        <span>Total Realized: <strong>{N(totalR)}</strong></span>
        <span>Completed: <strong>{pC}/{list.length}</strong></span>
        <span>Outstanding: <strong>{N(tO)}</strong></span>
        {target>0&&<span>Target/Student: <strong>{N(target)}</strong></span>}
      </div>
    </div>
    <div className="kg np">
      <div className="kpi" style={{"--accent":"var(--green)"}}><div className="kl">Total Realized</div><div className="kv" style={{color:"var(--green)"}}>{N(totalR)}</div><div className="ksub">{sc} — {cat}</div></div>
      <div className="kpi" style={{"--accent":"var(--blue)"}}><div className="kl">Completed</div><div className="kv">{pC} / {list.length}</div><div className="ksub">students</div></div>
      <div className="kpi" style={{"--accent":"var(--red)"}}><div className="kl">Outstanding</div><div className="kv" style={{color:"var(--red)"}}>{N(tO)}</div><div className="ksub">{oC} students owing</div></div>
    </div>
    {pC>0&&<div className="card analysis-section" id="analysis-completed">
      <div className="fb" style={{marginBottom:8}}>
        <div className="sect" style={{color:"var(--green)",marginBottom:0}}>✅ Completed ({pC})</div>
        <button className="btn btn-gold btn-xs np" onClick={()=>doPrintSection("analysis-completed")}>🖨 Print Completed</button>
      </div>
      <div className="tw"><table><thead><tr><th>#</th><th>Student</th><th>Adm No</th><th className="r">Paid</th></tr></thead><tbody>{an.filter(a=>a.ok).map((a,i)=><tr key={a.name}><td style={{color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:600}}>{a.name}</td><td className="mn">{a.admno}</td><td className="my">{N(a.paid)}</td></tr>)}</tbody></table></div>
    </div>}
    {oC>0&&<div className="card analysis-section" id="analysis-owing">
      <div className="fb" style={{marginBottom:8}}>
        <div className="sect" style={{color:"var(--red)",marginBottom:0}}>⚠️ Yet to Complete ({oC})</div>
        <button className="btn btn-red btn-xs np" onClick={()=>doPrintSection("analysis-owing")}>🖨 Print Owing</button>
      </div>
      <div className="tw"><table><thead><tr><th>#</th><th>Student</th><th>Adm No</th><th className="r">Paid</th><th className="r">Owing</th></tr></thead><tbody>{an.filter(a=>!a.ok&&target>0).map((a,i)=><tr key={a.name}><td style={{color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:600}}>{a.name}</td><td className="mn">{a.admno}</td><td className="my">{N(a.paid)}</td><td className="mr">{N(a.owing)}</td></tr>)}</tbody></table></div>
    </div>}
    {target===0&&<div className="msg-warn np">⚠ No target set for "{cat}" in {sc}. Go to Settings → Fee Targets.</div>}
    <div className="po" style={{marginTop:24,paddingTop:16,borderTop:"1px dashed #ccc",fontSize:".65rem",color:"#888",textAlign:"center"}}>
      Report generated by: {ctx.session?.name} · {new Date().toLocaleString()}
    </div>
  </div>
  );
}

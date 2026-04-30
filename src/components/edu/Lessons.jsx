import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B, ALL_CLS, DAYS } from '../../constants';
import { N, today, uid, fmtD } from '../../utils/helpers';

export default function Lessons({sec}){
  const ctx=useApp();
  const role=ctx.session?.role;
  const isAdmin=role==="admin"||role==="superadmin";
  const sessionSection=ctx.session?.section; // "A", "B", or "both"
  
  const[activeSec,setActiveSec]=useState(()=>{
    if(!isAdmin&&sessionSection!=="both")return sessionSection;
    return sec||"A";
  });
  
  useEffect(()=>{if(isAdmin||sessionSection==="both"){setActiveSec(sec||"A")}},[sec, isAdmin, sessionSection]);
  
  const sectionClasses=activeSec==="A"?SEC_A:SEC_B;
  const lc=ctx.lessonCur||{days:{},teacherRate:2500,teacherCount:10};const days=lc.days||{};const rate=Number(lc.teacherRate)||0;const tc=Number(lc.teacherCount)||0;
  const setDC=(d,c,v)=>{const nd={...days,[d]:{...(days[d]||{}),[c]:parseFloat(v)||0}};ctx.setLessonCur({...lc,days:nd})};
  
  const dt={};DAYS.forEach(d=>{dt[d]=sectionClasses.reduce((s,c)=>s+(days[d]?.[c]||0),0)});
  const gt=Object.values(dt).reduce((s,v)=>s+v,0);const tp=rate*tc;const pr=gt-tp;
  const gtAll=DAYS.reduce((s,d)=>s+ALL_CLS.reduce((ss,c)=>ss+(days[d]?.[c]||0),0),0);
  
  async function close(){
    if(!isAdmin)return;
    const w={wid:uid(),date:today(),days:{...days},teacherRate:rate,teacherCount:tc,grandTotal:gtAll,totalTeacherPay:tp,proprietorShare:gtAll-tp,created_at:new Date().toISOString()};
    await ctx.saveLW(w);
    const newLc={days:{},teacherRate:rate,teacherCount:tc};ctx.setLessonCur(newLc);
    ctx.addAudit("LESSON_CLOSE",`${N(gtAll)} — Teachers: ${N(tp)}, Proprietor: ${N(gtAll-tp)}`,ctx.session?.name);
    await ctx.saveAllSettings(ctx.categories,ctx.feeTargets,ctx.termCfg,newLc,ctx.schoolProfile,ctx.aiConfig);
  }
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:8}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Lesson Portal — Weekly Cycle</h2>
      {(isAdmin||sessionSection==="both")&&<div className="stg">
        <button className={"stb"+(activeSec==="A"?" a":"")} onClick={()=>setActiveSec("A")}>Section A</button>
        <button className={"stb"+(activeSec==="B"?" a":"")} onClick={()=>setActiveSec("B")}>Section B</button>
      </div>}
    </div>
    <div className="msg-info" style={{marginBottom:14}}>ℹ Lesson fees are completely independent of the Daily Cash Book. They do not appear in student ledgers or fee categories. Viewing: <strong>Section {activeSec}</strong> — {activeSec==="A"?"Crèche to Primary 1":"Primary 2 to SS3"}.</div>
    
    <div className="card"><div className="sect">Week Configuration</div><div className="fr">
      <div className="fl"><span className="flb">Flat Rate / Teacher (₦)</span><input type="number" value={rate} onChange={e=>ctx.setLessonCur({...lc,teacherRate:parseFloat(e.target.value)||0})} className="inpm" style={{width:140}}/></div>
      <div className="fl"><span className="flb">Teachers on Ground</span><input type="number" value={tc} onChange={e=>ctx.setLessonCur({...lc,teacherCount:parseInt(e.target.value)||0})} className="inpm" style={{width:110}}/></div>
    </div></div>
    
    <div className="card"><div className="sect">Daily Collection — Section {activeSec} Classes</div><div style={{overflowX:"auto"}}>
      <div className="lg" style={{gridTemplateColumns:`140px repeat(${DAYS.length},1fr) 95px`,minWidth:700}}>
        <div className="lh" style={{textAlign:"left",paddingLeft:10}}>Class</div>{DAYS.map(d=><div key={d} className="lh">{d.slice(0,3)}</div>)}<div className="lh">Total</div>
        {sectionClasses.map(c=>{const rt=DAYS.reduce((s,d)=>s+(days[d]?.[c]||0),0);return<React.Fragment key={c}>
          <div className="lc" style={{textAlign:"left",paddingLeft:10,fontSize:".74rem",fontWeight:500}}>{c}</div>
          {DAYS.map(d=><div key={d} className="lc"><input type="number" min="0" value={days[d]?.[c]||""} onChange={e=>setDC(d,c,e.target.value)} className="li" placeholder="0"/></div>)}
          <div className="lc lt" style={{fontSize:".76rem"}}>{rt>0?N(rt):"—"}</div>
        </React.Fragment>;})}
        <div className="lc lt" style={{textAlign:"left",paddingLeft:10,fontWeight:700,fontSize:".74rem"}}>DAY TOTAL</div>{DAYS.map(d=><div key={d} className="lc lt" style={{fontSize:".76rem"}}>{dt[d]>0?N(dt[d]):"—"}</div>)}
        <div className="lc" style={{background:"var(--navy)",color:"var(--gold)",fontFamily:"var(--ff-m)",fontWeight:800,fontSize:".8rem"}}>{N(gt)}</div>
      </div></div></div>
      
    <div className="card"><div className="sect">Weekly Settlement — Section {activeSec}</div><div className="kg">
      <div className="kpi" style={{"--accent":"var(--navy)"}}><div className="kl">Section {activeSec} Total</div><div className="kv">{N(gt)}</div></div>
      <div className="kpi" style={{"--accent":"var(--green)"}}><div className="kl">Teachers ({tc}×{N(rate)})</div><div className="kv" style={{color:"var(--green)"}}>{N(tp)}</div></div>
      <div className="kpi" style={{"--accent":pr>=0?"var(--blue)":"var(--red)"}}><div className="kl">Proprietor Share</div><div className="kv" style={{color:pr>=0?"var(--blue)":"var(--red)"}}>{N(Math.max(0,gt-tp))}</div></div>
      {isAdmin&&gtAll!==gt&&<div className="kpi" style={{"--accent":"var(--amber)"}}><div className="kl">Combined (A+B)</div><div className="kv">{N(gtAll)}</div><div className="ksub">All sections</div></div>}
    </div>
    {isAdmin&&gtAll>0&&<button className="btn btn-green" onClick={close}>✓ CLOSE WEEK & ARCHIVE (All Sections)</button>}
    {!isAdmin&&<p className="hint">Only Admin can approve week close.</p>}
    </div>
    
    {(ctx.lessonWeeks||[]).length>0&&<div className="card"><div className="sect">Archived Weeks</div><div className="tw"><table><thead><tr><th>Date Closed</th><th className="r">Total</th><th className="r">Teachers</th><th className="r">Rate/Teacher</th><th className="r">Proprietor</th></tr></thead><tbody>{[...(ctx.lessonWeeks||[])].reverse().map(a=><tr key={a.wid}><td>{fmtD(a.date)}</td><td className="my">{N(a.grandTotal)}</td><td className="my">{N(a.totalTeacherPay)}</td><td className="my">{N(a.teacherRate)}</td><td className={a.proprietorShare>=0?"my":"mr"}>{N(a.proprietorShare)}</td></tr>)}</tbody></table></div></div>}
  </div>
  );
}

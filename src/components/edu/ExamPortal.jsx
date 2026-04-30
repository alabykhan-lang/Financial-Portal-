import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EXAM_CLS } from '../../constants';
import { N, today, uid, fmtD } from '../../utils/helpers';

export default function ExamPortal(){
  const ctx=useApp();
  const[sc,setSc]=useState("Primary 5");
  const[en,setEn]=useState({student:"",examType:"",amount:""});
  const[msg,setMsg]=useState(null);
  const sl=(ctx.students[sc]||[]).map(s=>s.name);
  const fl=(ctx.extExams||[]).filter(e=>e.class_name===sc);
  
  async function add(){
    if(!en.student||!en.examType||!en.amount)return;
    await ctx.saveExt({eid:uid(),class_name:sc,...en,amount:parseFloat(en.amount),date:today(),created_at:new Date().toISOString()});
    setEn({student:"",examType:"",amount:""});
    setMsg({t:0,m:"Added."});
    setTimeout(()=>setMsg(null),2e3)
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)",marginBottom:14}}>External Exams</h2>
    {msg&&<div className="msg-ok">{msg.m}</div>}
    <div className="cp">{EXAM_CLS.map(c=><button key={c} className={"pill"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c}</button>)}</div>
    <div className="card"><div className="fr">
      <div className="fl"><span className="flb">Student</span><select value={en.student} onChange={e=>setEn({...en,student:e.target.value})} className="sel"><option value="">—</option>{sl.map(n=><option key={n}>{n}</option>)}</select></div>
      <div className="fl"><span className="flb">Exam Type</span><input value={en.examType} onChange={e=>setEn({...en,examType:e.target.value})} className="inp" placeholder="e.g. WAEC, BECE"/></div>
      <div className="fl"><span className="flb">Amount (₦)</span><input type="number" value={en.amount} onChange={e=>setEn({...en,amount:e.target.value})} className="inpm" placeholder="0"/></div>
      <button className="btn btn-gold" onClick={add}>ADD</button>
    </div></div>
    <div className="tw"><table><thead><tr><th>#</th><th>Student</th><th>Exam</th><th className="r">Amount</th><th>Date</th></tr></thead><tbody>{fl.length===0&&<tr><td colSpan={5} className="er">No entries for {sc}.</td></tr>}{fl.map((e,i)=><tr key={e.eid}><td style={{color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:500}}>{e.student}</td><td>{e.examType}</td><td className="my">{N(e.amount)}</td><td>{fmtD(e.date)}</td></tr>)}</tbody></table></div>
  </div>
  );
}

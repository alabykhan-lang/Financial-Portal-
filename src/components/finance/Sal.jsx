import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { N, today, uid } from '../../utils/helpers';

export default function Sal(){
  const ctx=useApp();
  const[nm,setNm]=useState("");const[py,setPy]=useState("");const[msg,setMsg]=useState(null);
  const total=(ctx.salaries||[]).reduce((s,x)=>s+(x.netPay||0),0);
  
  async function add(){
    if(!nm.trim()||!py)return;
    await ctx.saveSal({sid:uid(),name:nm.trim(),netPay:parseFloat(py),month:today().slice(0,7),created_at:new Date().toISOString()});
    ctx.addAudit("SALARY",`${nm.trim()} — ${N(parseFloat(py))}`,ctx.session?.name);
    setNm("");setPy("");setMsg({t:0,m:"Added."});
    setTimeout(()=>setMsg(null),2e3)
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)",marginBottom:14}}>Salaries Portal</h2>
    {msg&&<div className="msg-ok">{msg.m}</div>}
    <div className="card"><div className="sect">Add Staff</div><div className="fr">
      <div className="fl" style={{flex:2}}><span className="flb">Full Name</span><input value={nm} onChange={e=>setNm(e.target.value)} className="inp" placeholder="Staff full name"/></div>
      <div className="fl" style={{flex:1}}><span className="flb">Net Pay (₦)</span><input type="number" value={py} onChange={e=>setPy(e.target.value)} className="inpm" placeholder="0.00"/></div>
      <button className="btn btn-gold" onClick={add}>ADD STAFF</button>
    </div></div>
    <div className="card"><div className="fb" style={{marginBottom:10}}><div className="sect" style={{marginBottom:0}}>Staff List</div><div style={{fontFamily:"var(--ff-m)",fontSize:".78rem",color:"var(--navy)",fontWeight:700}}>Total Payroll: {N(total)}</div></div>
    <div className="tw"><table><thead><tr><th>#</th><th>Name</th><th className="r">Net Pay</th><th>Month</th></tr></thead><tbody>{(ctx.salaries||[]).length===0&&<tr><td colSpan={4} className="er">No staff records.</td></tr>}{(ctx.salaries||[]).map((s,i)=><tr key={s.sid}><td style={{color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:500}}>{s.name}</td><td className="my">{N(s.netPay)}</td><td style={{color:"var(--muted)"}}>{s.month}</td></tr>)}</tbody></table></div></div>
  </div>
  );
}

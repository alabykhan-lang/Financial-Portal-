import React from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B, ALL_CLS } from '../../constants';
import { N } from '../../utils/helpers';

export default function Dash({sec}){
  const ctx=useApp();
  const ae=sec? (ctx.cashBook||[]).filter(e=>e.section===sec) : (ctx.cashBook||[]);
  const secClasses=sec==="A"?SEC_A:sec==="B"?SEC_B:ALL_CLS;
  const ti=ae.filter(e=>e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
  const te=ae.filter(e=>e.entry_type==="Expense"&&!e.reversal_of).reduce((s,e)=>s+e.amount,0);
  const pt=ae.filter(e=>e.is_prior_term&&e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
  const catBk={};ae.filter(e=>e.entry_type==="Income"&&!e.reversed).forEach(e=>{catBk[e.category]=(catBk[e.category]||0)+e.amount});
  const cStats=secClasses.map(c=>{const st=ctx.students[c]||[];const tp=st.reduce((s,x)=>(x.payments||[]).filter(p=>p.amount>0).reduce((ps,p)=>ps+p.amount,0)+s,0);return{c,n:st.length,tp}}).filter(x=>x.n>0);
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:14}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Dashboard — Section {sec||"All"}</h2>
    </div>
    <div className="msg-warn">⚠ {(ctx.directPay||[]).length} direct payment(s) on record. {(ctx.scholarships||[]).length} scholarship/mercy student(s). Verify in Settings.</div>
    <div className="kg">
      <div className="kpi" style={{"--accent":"var(--green)"}}><div className="kl">Live Liquidity</div><div className="kv" style={{color:"var(--green)"}}>{N(ti-te)}</div></div>
      <div className="kpi" style={{"--accent":"var(--blue)"}}><div className="kl">Current Revenue</div><div className="kv">{N(ti-pt)}</div></div>
      <div className="kpi" style={{"--accent":"var(--amber)"}}><div className="kl">Prior Term Recovery</div><div className="kv">{N(pt)}</div></div>
      <div className="kpi" style={{"--accent":"var(--red)"}}><div className="kl">Total Expenses</div><div className="kv" style={{color:"var(--red)"}}>{N(te)}</div></div>
    </div>
    {cStats.length>0&&<div className="card"><div className="sect">Collection by Class</div><div className="tw"><table><thead><tr><th>Class</th><th>Students</th><th className="r">Total Paid</th></tr></thead><tbody>{cStats.map(c=><tr key={c.c}><td style={{fontWeight:500}}>{c.c}</td><td style={{color:"var(--muted)"}}>{c.n}</td><td className="my">{N(c.tp)}</td></tr>)}</tbody></table></div></div>}
    {Object.keys(catBk).length>0&&<div className="card"><div className="sect">Income by Category</div>{Object.entries(catBk).sort((a,b)=>b[1]-a[1]).map(([c,a])=>{const mx=Math.max(...Object.values(catBk));return<div key={c} className="bar-r"><span className="bar-l">{c}</span><div className="bar-t"><div className="bar-f" style={{width:(a/mx*100)+"%"}}/></div><span className="bar-v">{N(a)}</span></div>;})}</div>}
  </div>
  );
}

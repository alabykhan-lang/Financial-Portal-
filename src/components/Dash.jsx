import React from 'react';
import { useApp } from '../context/AppContext';
import { N } from '../utils/helpers';

export default function Dash({sec}){
  const ctx=useApp();
  const ae=sec? (ctx.cashBook||[]).filter(e=>e.section===sec) : (ctx.cashBook||[]);
  const ti=ae.filter(e=>e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
  const te=ae.filter(e=>e.entry_type==="Expense"&&!e.reversal_of).reduce((s,e)=>s+e.amount,0);
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Dashboard — Section {sec||"All"}</h2>
    <div className="kg">
      <div className="kpi"><div className="kl">Total Income</div><div className="kv" style={{color:"var(--green)"}}>{N(ti)}</div></div>
      <div className="kpi"><div className="kl">Total Expenses</div><div className="kv" style={{color:"var(--red)"}}>{N(te)}</div></div>
      <div className="kpi"><div className="kl">Net Balance</div><div className="kv">{N(ti-te)}</div></div>
    </div>
  </div>
  );
}

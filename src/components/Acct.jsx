import React from 'react';
import { useApp } from '../context/AppContext';
import { N } from '../utils/helpers';

export default function Acct(){
  const ctx=useApp();const ae=ctx.cashBook||[];
  const ti=ae.filter(e=>e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
  const te=ae.filter(e=>e.entry_type==="Expense"&&!e.reversal_of).reduce((s,e)=>s+e.amount,0);
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Financial Accounting</h2>
    <div className="card">
      <div className="sect">P&L Summary</div>
      <div className="kg">
        <div className="kpi"><div className="kl">Income</div><div className="kv">{N(ti)}</div></div>
        <div className="kpi"><div className="kl">Expenses</div><div className="kv">{N(te)}</div></div>
        <div className="kpi"><div className="kl">Surplus</div><div className="kv">{N(ti-te)}</div></div>
      </div>
    </div>
  </div>
  );
}

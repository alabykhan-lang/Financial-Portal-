import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS, PAY_MODES } from '../constants';
import { today, N, uid } from '../utils/helpers';

export default function CashBook({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[amt,setAmt]=useState("");const[cat,setCat]=useState("");const[cl,setCl]=useState("");const[stu,setStu]=useState("");
  
  const stuList=(cl&&ctx.students[cl])?ctx.students[cl].map(s=>s.name):[];

  async function submit(){
    if(!cl||!stu||!cat||!amt)return;
    const eid=uid();
    await ctx.saveCashEntry({id:eid,date:today(),cls:cl,student:stu,category:cat,amount:parseFloat(amt),mode:"Cash",type:"Income",timestamp:Date.now(),section:sec});
    setAmt("");setStu("");
  }

  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:16}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem"}}>Daily Cash Book — Section {sec}</h2>
    </div>
    <div className="card">
      <div className="sect">New Income Entry</div>
      <div className="gf2">
        <div className="fl"><span className="flb">Class</span><select value={cl} onChange={e=>setCl(e.target.value)} className="sel"><option value="">Select Class</option>{classes.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fl"><span className="flb">Student</span><select value={stu} onChange={e=>setStu(e.target.value)} className="sel" disabled={!cl}><option value="">Select Student</option>{stuList.map(n=><option key={n}>{n}</option>)}</select></div>
        <div className="fl"><span className="flb">Category</span><select value={cat} onChange={e=>setCat(e.target.value)} className="sel"><option value="">Select Category</option>{DEF_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fl"><span className="flb">Amount</span><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} className="inpm" placeholder="0.00"/></div>
      </div>
      <button className="btn btn-gold" style={{marginTop:14}} onClick={submit}>SAVE ENTRY</button>
    </div>
  </div>
  );
}

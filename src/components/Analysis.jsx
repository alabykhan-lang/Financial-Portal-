import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS } from '../constants';
import { N } from '../utils/helpers';

export default function Analysis({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);const[cat,setCat]=useState(DEF_CATS[0]);
  const list=ctx.students[sc]||[];
  const target=(ctx.feeTargets||{})[sc]?.[cat]||0;
  const an=list.map(s=>{const p=(s.payments||[]).filter(x=>x.category===cat).reduce((sum,x)=>sum+x.amount,0);return{...s,paid:p,owing:target-p}});
  const totalR=an.reduce((s,a)=>s+a.paid,0);
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Payment Analysis — Section {sec}</h2>
    <div className="cp">{classes.map(c=><button key={c} className={"pill"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c}</button>)}</div>
    <div className="fr" style={{marginBottom:14}}><select value={cat} onChange={e=>setCat(e.target.value)} className="sel">{DEF_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="kg">
      <div className="kpi"><div className="kl">Total Realized</div><div className="kv" style={{color:"var(--green)"}}>{N(totalR)}</div></div>
      <div className="kpi"><div className="kl">Target/Student</div><div className="kv">{N(target)}</div></div>
    </div>
    <div className="card"><div className="tw"><table><thead><tr><th>Student</th><th className="r">Paid</th><th className="r">Owing</th></tr></thead>
    <tbody>{an.map(a=><tr key={a.name}><td>{a.name}</td><td className="my r">{N(a.paid)}</td><td className="mr r">{N(Math.max(0,a.owing))}</td></tr>)}</tbody></table></div></div>
  </div>
  );
}

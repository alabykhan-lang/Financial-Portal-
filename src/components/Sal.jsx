import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { N, today, uid } from '../utils/helpers';

export default function Sal(){
  const ctx=useApp();
  const[nm,setNm]=useState("");const[py,setPy]=useState("");
  
  async function add(){
    if(!nm||!py)return;
    await ctx.saveSal({sid:uid(),name:nm,netPay:parseFloat(py),month:today().slice(0,7)});
    setNm("");setPy("");
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Salaries Portal</h2>
    <div className="card"><div className="fr"><input value={nm} onChange={e=>setNm(e.target.value)} className="inp" placeholder="Staff Name"/><input type="number" value={py} onChange={e=>setPy(e.target.value)} className="inpm" placeholder="Pay"/><button className="btn btn-gold" onClick={add}>ADD</button></div></div>
    <div className="card"><div className="tw"><table><thead><tr><th>Name</th><th className="r">Net Pay</th></tr></thead><tbody>{(ctx.salaries||[]).map(s=><tr key={s.sid}><td>{s.name}</td><td className="my r">{N(s.netPay)}</td></tr>)}</tbody></table></div></div>
  </div>
  );
}

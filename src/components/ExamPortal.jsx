import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXAM_CLS } from '../constants';
import { N, today, uid } from '../utils/helpers';

export default function ExamPortal(){
  const ctx=useApp();
  const[sc,setSc]=useState(EXAM_CLS[0]);const[nm,setNm]=useState("");const[amt,setAmt]=useState("");
  
  async function add(){
    if(!nm||!amt)return;
    await ctx.saveExt({eid:uid(),class_name:sc,student:nm,amount:parseFloat(amt),date:today()});
    setNm("");setAmt("");
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>External Exams</h2>
    <div className="cp">{EXAM_CLS.map(c=><button key={c} className={"pill"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c}</button>)}</div>
    <div className="card"><div className="fr"><input value={nm} onChange={e=>setNm(e.target.value)} className="inp" placeholder="Student"/><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} className="inpm" placeholder="Amount"/><button className="btn btn-gold" onClick={add}>ADD</button></div></div>
  </div>
  );
}

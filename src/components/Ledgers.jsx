import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS } from '../constants';
import { fmtD, N } from '../utils/helpers';
import ReceiptDoc from './ReceiptDoc';

export default function Ledgers({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);const[ss,setSs]=useState("");const[viewRcp,setViewRcp]=useState(null);const[printing,setPrinting]=useState(false);
  const list=ctx.students[sc]||[];const stu=list.find(s=>s.name===ss);const pays=(stu?.payments||[]);
  const total=pays.filter(p=>p.amount>0).reduce((s,p)=>s+p.amount,0);
  const sp=ctx.schoolProfile||{};const bSig=sec==="A"?sp.bursarASignature:sp.bursarBSignature;
  
  useEffect(()=>{if(viewRcp&&printing){const t=setTimeout(()=>{window.print();setPrinting(false)},350);return()=>clearTimeout(t)}},[viewRcp,printing]);
  
  function openReceipt(type,payments,total,cat){setViewRcp({type,student:stu,cls:sc,payments,total,receiptId:"RC"+Date.now(),issuedBy:ctx.session?.name,issuedAt:new Date().toISOString(),category:cat});setPrinting(false);}
  function printReceipt(type,payments,total,cat){setViewRcp({type,student:stu,cls:sc,payments,total,receiptId:"RC"+Date.now(),issuedBy:ctx.session?.name,issuedAt:new Date().toISOString(),category:cat});setPrinting(true);}
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Student Ledgers — Section {sec}</h2>
    <div className="fr" style={{marginBottom:14}}>
      <select value={sc} onChange={e=>setSc(e.target.value)} className="sel" style={{flex:1}}>{classes.map(c=><option key={c}>{c}</option>)}</select>
      <select value={ss} onChange={e=>setSs(e.target.value)} className="sel" style={{flex:2}}><option value="">Select Student</option>{list.map(s=><option key={s.name}>{s.name}</option>)}</select>
    </div>
    {ss&&stu?<div><div className="card">
      <div className="fb"><div><strong>{stu.name}</strong><br/><span className="badge bdb">{stu.admno}</span></div><div className="kpi"><div className="kl">Total Paid</div><div className="kv" style={{color:"var(--green)"}}>{N(total)}</div></div></div>
      <div className="tw"><table><thead><tr><th>Date</th><th>Category</th><th className="r">Amount</th><th>Action</th></tr></thead>
      <tbody>{pays.map((p,i)=><tr key={i}><td>{fmtD(p.date)}</td><td>{p.category}</td><td className="my r">{N(p.amount)}</td><td><button className="btn btn-ghost btn-xs" onClick={()=>printReceipt("single",[p],p.amount,p.category)}>🖨</button></td></tr>)}</tbody></table></div>
      <div className="fr" style={{marginTop:12}}><button className="btn btn-gold" onClick={()=>printReceipt("all",pays,total,null)}>🖨 PRINT STATEMENT</button></div>
    </div>
    {viewRcp&&<div className="print-receipt" style={{marginTop:20}}><ReceiptDoc viewRcp={viewRcp} sec={sec} sp={sp} bSig={bSig} ctx={ctx}/></div>}
    </div>:<p className="hint">Select student to view ledger.</p>}
  </div>
  );
}

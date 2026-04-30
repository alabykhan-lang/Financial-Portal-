import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS } from '../../constants';
import { fmtD, N } from '../../utils/helpers';
import ReceiptDoc from './ReceiptDoc';

export default function Ledgers({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);const[ss,setSs]=useState("");const[viewRcp,setViewRcp]=useState(null);const[printing,setPrinting]=useState(false);
  const list=ctx.students[sc]||[];const stu=list.find(s=>s.name===ss);const pays=(stu?.payments||[]);
  const tuitionPays=pays.filter(p=>p.category==="Tuition Fee"&&p.amount>0);
  const posPays=pays.filter(p=>p.amount>0);const total=posPays.reduce((s,p)=>s+p.amount,0);const tuitionTotal=tuitionPays.reduce((s,p)=>s+p.amount,0);
  const isPropUser=ctx.session?.isProp||ctx.session?.isSuper;
  const sp=ctx.schoolProfile||{};const bSig=sec==="A"?sp.bursarASignature:sp.bursarBSignature;
  const adminSig=sp.adminSignature||"";
  const catP={};pays.forEach(p=>{catP[p.category]=(catP[p.category]||0)+p.amount});
  const cats=(ctx.categories||DEF_CATS).filter(c=>ctx.termCfg?.activeCats?.[c]!==false&&c!=="Outstanding/Backlog");
  const classTargets=(ctx.feeTargets||{})[sc]||{};
  const allPaid=cats.every(c=>{const t=classTargets[c]||0;return t===0||(catP[c]||0)>=t});
  
  useEffect(()=>{if(viewRcp&&printing){const t=setTimeout(()=>{window.print();setPrinting(false)},350);return()=>clearTimeout(t)}},[viewRcp,printing]);
  
  function makeReceiptId(){const d=new Date();const yr=d.getFullYear().toString().slice(-2);const mo=String(d.getMonth()+1).padStart(2,"0");const dy=String(d.getDate()).padStart(2,"0");const rnd=Math.floor(Math.random()*10000).toString().padStart(4,"0");return`WTS/${yr}${mo}${dy}/${rnd}`}
  function openReceipt(type,payments,total,category){setViewRcp({type,student:stu,cls:sc,payments,total,receiptId:makeReceiptId(),issuedBy:ctx.session?.name,issuedAt:new Date().toISOString(),isPropPay:isPropUser,category:category||null});setPrinting(false);}
  function printReceipt(type,payments,total,category){setViewRcp({type,student:stu,cls:sc,payments,total,receiptId:makeReceiptId(),issuedBy:ctx.session?.name,issuedAt:new Date().toISOString(),isPropPay:isPropUser,category:category||null});setPrinting(true);}
  
  const paysByCat={};posPays.forEach(p=>{if(!paysByCat[p.category])paysByCat[p.category]=[];paysByCat[p.category].push(p)});
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)",marginBottom:14}}>Student Ledgers — Section {sec}</h2>
    <div className="fr" style={{marginBottom:14}}>
      <select value={sc} onChange={e=>{setSc(e.target.value);setSs("");setViewRcp(null)}} className="sel" style={{flex:1}}>{classes.map(c=><option key={c}>{c}</option>)}</select>
      <select value={ss} onChange={e=>{setSs(e.target.value);setViewRcp(null)}} className="sel" style={{flex:2}}><option value="">— Select Student —</option>{list.map(s=><option key={s.name}>{s.name}</option>)}</select>
    </div>
    {ss&&stu?<div><div className="card">
      <div className="fb" style={{marginBottom:14}}>
        <div>
          <div style={{fontFamily:"var(--ff-d)",fontSize:"1.05rem",color:"var(--navy)",fontWeight:700}}>{stu.name}</div>
          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}><span className="badge bdb">{stu.admno}</span><span className="badge" style={{background:"var(--bg2)",color:"var(--slate)",border:"1px solid var(--border)"}}>{sc}</span>{allPaid&&<span className="badge bdg">✓ Fully Paid</span>}</div>
        </div>
        <div style={{padding:"10px 16px",background:"var(--greenbg)",borderRadius:8,textAlign:"center",border:"1px solid var(--greenbdr)"}}><div style={{fontSize:".62rem",fontWeight:700,textTransform:"uppercase",color:"var(--green)"}}>Total Paid</div><div style={{fontFamily:"var(--ff-m)",fontWeight:800,color:"var(--green)",fontSize:"1rem",marginTop:3}}>{N(total)}</div></div>
      </div>
      
      <div style={{marginBottom:14}}>
        <div style={{fontSize:".66rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"var(--muted)",marginBottom:8}}>Fee Status by Category</div>
        {cats.map(cat=>{const p=catP[cat]||0;const t=classTargets[cat]||0;const ok=t>0&&p>=t;const partial=p>0&&!ok;const catPays=paysByCat[cat]||[];return<div key={cat} style={{display:"flex",alignItems:"center",padding:"7px 10px",borderRadius:6,marginBottom:4,background:ok?"var(--greenbg)":partial?"var(--amberbg)":"var(--bg2)",border:"1px solid "+(ok?"var(--greenbdr)":partial?"#fbbf24":"var(--border)")}}>
          <div style={{flex:1}}>
            <span style={{fontSize:".8rem",fontFamily:"var(--ff-m)",fontWeight:ok||partial?700:400,color:ok?"var(--green)":partial?"var(--amber)":"var(--muted)"}}>{cat}</span>
            <span style={{fontSize:".74rem",color:"var(--muted)",marginLeft:8}}>{N(p)}{t>0?` / ${N(t)}`:""}{ok?" ✓":""}</span>
          </div>
          {catPays.length>0&&<div style={{display:"flex",gap:4}}>
            <button className="btn btn-ghost btn-xs np" onClick={()=>openReceipt("category",catPays,catPays.reduce((s,x)=>s+x.amount,0),cat)} title="View receipt">👁</button>
            <button className="btn btn-gold btn-xs np" onClick={()=>printReceipt("category",catPays,catPays.reduce((s,x)=>s+x.amount,0),cat)} title="Print receipt for this category">🖨</button>
          </div>}
        </div>;})}
      </div>
      
      <div className="tw"><table><thead><tr><th>Date</th><th>Time</th><th>Category</th><th className="r">Amount</th><th>Mode</th><th>Tag</th><th>Rcpt</th></tr></thead>
      <tbody>{pays.length===0&&<tr><td colSpan={7} className="er">No payment records.</td></tr>}
      {pays.map((p,i)=><tr key={p.id||i} className={p.amount<0?"rvr":""}><td>{fmtD(p.date)}</td><td className="mn">{p.timestamp?new Date(p.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}</td><td>{p.category}</td><td className={p.amount<0?"mr":"my"}>{N(p.amount)}</td><td><span className="badge" style={{background:"var(--bg2)",color:"var(--slate)",border:"1px solid var(--border)"}}>{p.mode||""}</span></td><td>{p.isPriorTerm?<span className="badge bdo">Prior</span>:p.note?<span className="badge bdr">Rev</span>:<span className="badge bdg">Current</span>}</td><td>{p.amount>0&&<button className="btn btn-ghost btn-xs" onClick={()=>printReceipt("single",[p],p.amount,p.category)} title="Print receipt">🖨</button>}</td></tr>)}
      </tbody></table></div>
      
      <div className="fr" style={{marginTop:12,flexWrap:"wrap"}}>
        {tuitionPays.length>0&&<button className="btn btn-gold np" onClick={()=>openReceipt("tuition",tuitionPays,tuitionTotal,"Tuition Fee")}>👁 View Tuition Receipt</button>}
        {tuitionPays.length>0&&<button className="btn btn-outline btn-sm np" onClick={()=>printReceipt("tuition",tuitionPays,tuitionTotal,"Tuition Fee")}>🖨 Print Tuition Receipt</button>}
        {posPays.length>0&&<button className="btn btn-ghost btn-sm np" onClick={()=>openReceipt("all",posPays,total,null)}>👁 Full Statement</button>}
        {posPays.length>0&&<button className="btn btn-ghost btn-sm np" onClick={()=>printReceipt("all",posPays,total,null)}>🖨 Print Full Statement</button>}
      </div>
      <p className="hint" style={{marginTop:6}}>Ledger is read-only. Use category buttons above for per-category receipts.</p>
    </div>
    {/* RECEIPT PANEL - always visible when open, print-receipt class used for isolated printing */}
    {viewRcp&&<div style={{marginTop:16,padding:"0 0 20px 0"}}>
      <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"flex-end"}} className="np">
        <button className="btn btn-gold btn-sm" onClick={()=>setPrinting(true)}>🖨 Print This Receipt</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>setViewRcp(null)}>✕ Close Receipt</button>
      </div>
      <div className="print-receipt">
        <ReceiptDoc viewRcp={viewRcp} sec={sec} sp={sp} bSig={bSig} adminSig={adminSig} ctx={ctx}/>
      </div>
    </div>}
    </div>:<p className="hint" style={{padding:20,textAlign:"center"}}>Select a class and student to view their ledger.</p>}
  </div>
  );
}

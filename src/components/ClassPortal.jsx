import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SEC_A, SEC_B } from '../constants';
import { sbP } from '../utils/api';
import { N, uid, LS } from '../utils/helpers';

export default function ClassPortal({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);const[ocrText,setOcrText]=useState("");const[showOCR,setShowOCR]=useState(false);const[ocrLoad,setOcrLoad]=useState(false);const[msg,setMsg]=useState(null);const fileRef=useRef();const list=ctx.students[sc]||[];
  const isAdmin=ctx.session?.role==="admin"||ctx.session?.role==="superadmin";
  
  async function handleDelete(s,cls){
    if(!isAdmin){setMsg({t:1,m:"Only administrators can remove students."});return}
    if(!window.confirm(`Remove ${s.name} from ${cls}?`))return;
    await ctx.deleteStudent(cls,s.admno,s.supaId);
    setMsg({t:0,m:`✓ Student removed.`});setTimeout(()=>setMsg(null),3000);
  }
  
  async function bulkImport(){
    const names=ocrText.split("\n").map(n=>n.trim()).filter(Boolean);
    if(!names.length)return;
    const up={...ctx.students};if(!up[sc])up[sc]=[];
    for(const nm of names){
      if(!up[sc].find(s=>s.name.toLowerCase()===nm.toLowerCase())){
        const ns={name:nm,class_key:sc.toLowerCase().replace(/\s+/g,""),admno:"WTS-"+uid().slice(0,6).toUpperCase(),gender:""};
        try{const r=await sbP("students",ns);up[sc].push({name:nm,admno:ns.admno,gender:"",supaId:r[0]?.id,payments:[],arrears:0})}
        catch{up[sc].push({name:nm,admno:ns.admno,gender:"",payments:[],arrears:0})}
      }
    }
    ctx.setStudents(up);LS.s("ssfp_students",up);setOcrText("");setShowOCR(false);
    setMsg({t:0,m:"✓ Students imported."});setTimeout(()=>setMsg(null),3000);
  }
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:14}}><h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem"}}>Class Portal — Section {sec}</h2></div>
    {msg&&<div className={msg.t?"msg-err":"msg-ok"}>{msg.m}</div>}
    <div className="cp">{classes.map(c=><button key={c} className={"pill"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c} ({ (ctx.students[c]||[]).length })</button>)}</div>
    <div className="card">
      <div className="fr"><button className="btn btn-outline btn-sm" onClick={()=>setShowOCR(!showOCR)}>{showOCR?"Cancel":"📋 Bulk Import Names"}</button></div>
      {showOCR&&<div style={{marginTop:12}}><textarea value={ocrText} onChange={e=>setOcrText(e.target.value)} className="textarea" rows={6} placeholder="Enter names, one per line"/><button className="btn btn-gold" style={{marginTop:8}} onClick={bulkImport}>IMPORT</button></div>}
    </div>
    <div className="tw"><table><thead><tr><th>#</th><th>Student Name</th><th>Adm No</th><th className="r">Total Paid</th><th>Status</th>{isAdmin&&<th>Action</th>}</tr></thead>
    <tbody>{list.length===0&&<tr><td colSpan={6} className="er">No students.</td></tr>}
    {list.map((s,i)=>{const paid=(s.payments||[]).filter(p=>p.amount>0).reduce((sum,p)=>sum+p.amount,0);return<tr key={i}><td>{i+1}</td><td style={{fontWeight:600}}>{s.name}</td><td>{s.admno}</td><td className="my r">{N(paid)}</td><td><span className="badge bdg">✓ Active</span></td>{isAdmin&&<td><button className="btn btn-red btn-xs" onClick={()=>handleDelete(s,sc)}>🗑</button></td>}</tr>;})}
    </tbody></table></div>
  </div>
  );
}

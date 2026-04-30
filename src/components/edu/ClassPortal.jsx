import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B } from '../../constants';
import { sbP } from '../../utils/api';
import { N, uid, LS } from '../../utils/helpers';

export default function ClassPortal({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const[sc,setSc]=useState(classes[0]);const[ocrText,setOcrText]=useState("");const[showOCR,setShowOCR]=useState(false);const[ocrLoad,setOcrLoad]=useState(false);const[msg,setMsg]=useState(null);const fileRef=useRef();const list=ctx.students[sc]||[];
  const isAdmin=ctx.session?.role==="admin"||ctx.session?.role==="superadmin";
  
  async function handleDelete(s,cls){
    if(!isAdmin){setMsg({t:1,m:"Only administrators can remove students."});return}
    const hasPay=(s.payments||[]).length>0;
    const confirm_msg=hasPay?`WARNING: ${s.name} has ${s.payments.length} payment record(s). Removing them from the database does NOT delete their Cash Book entries. Continue?`:`Remove ${s.name} (${s.admno}) from ${cls}? This cannot be undone.`;
    if(!window.confirm(confirm_msg))return;
    await ctx.deleteStudent(cls,s.admno,s.supaId);
    ctx.addAudit("DELETE_STUDENT",`Removed ${s.name} (${s.admno}) from ${cls}`,ctx.session?.name);
    ctx.addNotif(`Student removed: ${s.name} from ${cls}.`,"warning");
    setMsg({t:0,m:`✓ ${s.name} removed from ${cls}.`});setTimeout(()=>setMsg(null),4e3);
  }
  
  async function handleOCR(file){if(!file)return;setOcrLoad(true);try{const b64=await new Promise((r,j)=>{const f=new FileReader();f.onload=()=>r(f.result.split(",")[1]);f.onerror=j;f.readAsDataURL(file)});const resp=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(ctx.aiConfig?.apiKey||"")},body:JSON.stringify({model:ctx.aiConfig?.model||"google/gemini-2.0-flash-001",messages:[{role:"user",content:[{type:"text",text:"Extract student names from this image. Return ONLY names, one per line. No numbers, prefixes, or extra text."},{type:"image_url",image_url:{url:"data:image/jpeg;base64,"+b64}}]}]})});const data=await resp.json();const text=data?.choices?.[0]?.message?.content||"";if(text.trim()){setOcrText(text.trim());setShowOCR(true)}else setMsg({t:1,m:"No names extracted."})}catch(e){setMsg({t:1,m:"OCR failed. Add AI key in Settings or paste manually."})}setOcrLoad(false)}
  
  async function bulkImport(){const names=ocrText.split("\n").map(n=>n.trim()).filter(Boolean);if(!names.length)return;const up={...ctx.students};if(!up[sc])up[sc]=[];let added=0;for(const nm of names){if(!up[sc].find(s=>s.name.toLowerCase()===nm.toLowerCase())){const ck=sc.toLowerCase().replace(/[èé]/g,"e").replace(/\s+/g,"");const ns={name:nm,class_key:ck,admno:"WTS-"+uid().slice(0,6).toUpperCase(),gender:""};try{const r=await sbP("students",ns);up[sc].push({name:nm,admno:ns.admno,gender:"",supaId:r[0]?.id,payments:[],arrears:0})}catch{up[sc].push({name:nm,admno:ns.admno,gender:"",payments:[],arrears:0})}added++}}ctx.setStudents(up);LS.s("ssfp_students",up);setOcrText("");setShowOCR(false);setMsg({t:0,m:`✓ ${added} students imported (${names.length-added} duplicates skipped)`});setTimeout(()=>setMsg(null),4e3)}
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:14}}><h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Class Portal — Section {sec}</h2></div>
    {msg&&<div className={msg.t?"msg-err":"msg-ok"}>{msg.m}</div>}
    <div className="cp">{classes.map(c=><button key={c} className={"pill"+(sc===c?" a":"")} onClick={()=>setSc(c)}>{c} <span style={{fontFamily:"var(--ff-m)",fontSize:".6rem",opacity:.7}}>({(ctx.students[c]||[]).length})</span></button>)}</div>
    <div className="card"><div className="fr">
      <input type="file" ref={fileRef} accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleOCR(e.target.files[0])}/>
      <button className="btn btn-primary" onClick={()=>fileRef.current?.click()}>{ocrLoad?"Processing…":"📷 Camera / Gallery OCR"}</button>
      <button className="btn btn-outline btn-sm" onClick={()=>setShowOCR(!showOCR)}>{showOCR?"Cancel":"📋 Paste Names"}</button>
    </div>
    {showOCR&&<div style={{marginTop:12}}><p className="hint" style={{marginBottom:8}}>One name per line.</p><textarea value={ocrText} onChange={e=>setOcrText(e.target.value)} className="textarea" rows={6} placeholder={"Alabi Mubarak\nFatima Bello\nChinedu Okafor\n…"}/><button className="btn btn-gold" style={{marginTop:8}} onClick={bulkImport}>IMPORT TO DATABASE</button></div>}
    </div>
    <div className="tw"><table><thead><tr><th>#</th><th>Student Name</th><th>Adm No</th><th>Gender</th><th className="r">Total Paid</th><th>Tags</th><th>Status</th>{isAdmin&&<th>Action</th>}</tr></thead>
    <tbody>{list.length===0&&<tr><td colSpan={isAdmin?8:7} className="er">No students in {sc}. Sync or import above.</td></tr>}
    {list.map((s,i)=>{const paid=(s.payments||[]).filter(p=>p.amount>0).reduce((sum,p)=>sum+p.amount,0);const isSch=(ctx.scholarships||[]).some(x=>x.student===s.name&&x.class_name===sc);const isDP=(ctx.directPay||[]).some(x=>x.student===s.name&&x.class_name===sc);return<tr key={s.admno+s.name}><td style={{color:"var(--muted)",fontSize:".75rem"}}>{i+1}</td><td style={{fontWeight:600}}>{s.name}</td><td className="mn">{s.admno}</td><td style={{color:"var(--muted)"}}>{s.gender}</td><td style={{fontFamily:"var(--ff-m)",textAlign:"right",fontWeight:700,color:"var(--green)"}}>{N(paid)}</td><td>{isSch&&<span className="badge bdo">Scholar</span>}{isDP&&<span className="badge bdb">Direct</span>}</td><td>{(s.arrears||0)>0?<span className="badge bdr">Arrears</span>:<span className="badge bdg">✓ OK</span>}</td>{isAdmin&&<td><button className="btn btn-red btn-xs" onClick={()=>handleDelete(s,sc)} title="Remove student from database">🗑</button></td>}</tr>;})}
    </tbody></table></div>
  </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SEC_A, SEC_B, DEF_CATS, PAY_MODES } from '../../constants';
import { today, N, dayN, fmtD, uid } from '../../utils/helpers';

export default function CashBook({sec}){
  const ctx=useApp();
  const classes=sec==="A"?SEC_A:SEC_B;
  const entries=useMemo(()=>(ctx.cashBook||[]).filter(e=>e.section===sec).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||a.timestamp-b.timestamp),[ctx.cashBook,sec]);
  const activeCats=(ctx.categories||DEF_CATS).filter(c=>ctx.termCfg?.activeCats?.[c]!==false);
  const[date,setDate]=useState(today());const[cl,setCl]=useState("");const[stu,setStu]=useState("");const[cat,setCat]=useState("");const[amt,setAmt]=useState("");const[mode,setMode]=useState("Cash");const[type,setType]=useState("Income");const[desc,setDesc]=useState("");const[fd,setFd]=useState(today());const[showR,setShowR]=useState(false);const[rId,setRId]=useState("");const[msg,setMsg]=useState(null);const[saving,setSaving]=useState(false);
  const stuList=useMemo(()=>(cl&&ctx.students[cl])?[...ctx.students[cl]].sort((a,b)=>a.name.localeCompare(b.name)).map(s=>s.name):[],[cl,ctx.students]);
  const{op,clBal,dayE}=useMemo(()=>{let o=0;for(const e of entries)if(e.date<fd)o+=e.entry_type==="Income"?e.amount:-e.amount;const de=entries.filter(e=>e.date===fd);let c=o;for(const e of de)c+=e.entry_type==="Income"?e.amount:-e.amount;return{op:o,clBal:c,dayE:de}},[entries,fd]);
  const liq=useMemo(()=>(ctx.cashBook||[]).filter(e=>e.section===sec).reduce((s,e)=>s+(e.entry_type==="Income"?e.amount:-e.amount),0),[ctx.cashBook,sec]);
  const isExpense=type==="Expense";
  
  async function submit(){
    if(isExpense){
      if(!amt||isNaN(parseFloat(amt))){setMsg({t:1,m:"Enter the expense amount."});return}
      if(!desc.trim()){setMsg({t:1,m:"Enter what the expense is for (e.g. chalk, fuel)."});return}
    }else{
      if(!cl||!stu||!cat||!amt||isNaN(parseFloat(amt))){setMsg({t:1,m:"Fill all required fields."});return}
    }
    const a=Math.abs(parseFloat(parseFloat(amt).toFixed(2)));if(a<=0){setMsg({t:1,m:"Amount must be > zero."});return}
    setSaving(true);const eid=uid();
    if(isExpense){
      await ctx.saveCashEntry({id:eid,date,cls:null,student:null,category:"Expense",amount:a,mode,type:"Expense",timestamp:Date.now(),section:sec,isPriorTerm:false,description:desc.trim()});
      if(!ctx.session?.isProp&&!ctx.session?.isSuper)ctx.addAudit("EXPENSE",`Expense ${N(a)} — ${desc.trim()}`,ctx.session?.name);
      if(a>500000)ctx.addNotif(`Large expense of ${N(a)}: "${desc.trim()}". Verify.`);
      setAmt("");setDesc("");setSaving(false);setMsg({t:0,m:`✓ Expense of ${N(a)} (${desc}) recorded.`});setTimeout(()=>setMsg(null),4e3);
    }else{
      await ctx.saveCashEntry({id:eid,date,cls:cl,student:stu,category:cat,amount:a,mode,type:"Income",timestamp:Date.now(),section:sec,isPriorTerm:cat==="Outstanding/Backlog"});
      const up={...ctx.students};if(up[cl]){const idx=up[cl].findIndex(s=>s.name===stu);if(idx>=0){const cp=[...up[cl]];cp[idx]={...cp[idx],payments:[...cp[idx].payments,{id:eid,date,category:cat,amount:a,mode,isPriorTerm:cat==="Outstanding/Backlog",timestamp:Date.now(),receiptId:eid}]};up[cl]=cp;ctx.setStudents(up)}}
      if(!ctx.session?.isProp&&!ctx.session?.isSuper)ctx.addAudit("ENTRY",`Income ${N(a)} — ${stu} [${cat}]`,ctx.session?.name);
      if(a>500000)ctx.addNotif(`Large income of ${N(a)} for ${stu} in ${cl}. Verify.`);
      setAmt("");setCat("");setStu("");setSaving(false);setMsg({t:0,m:`✓ Income of ${N(a)} for ${stu} saved.`});setTimeout(()=>setMsg(null),4e3);
    }
  }
  
  async function doRev(){
    const orig=(ctx.cashBook||[]).find(e=>e.entry_id===rId);if(!orig){setMsg({t:1,m:"Entry ID not found."});return}if(orig.reversed){setMsg({t:1,m:"Entry already reversed."});return}
    const eid=uid();await ctx.markReversed(orig.entry_id);
    await ctx.saveCashEntry({id:eid,date:today(),cls:orig.class_name,student:orig.student,category:orig.category,amount:orig.amount,mode:orig.mode,type:orig.entry_type==="Income"?"Expense":"Income",timestamp:Date.now(),section:orig.section,isPriorTerm:orig.is_prior_term,note:"Reversal of "+orig.entry_id});
    if(orig.entry_type==="Income"){const up={...ctx.students};const c=orig.class_name;if(up[c]){const i=up[c].findIndex(s=>s.name===orig.student);if(i>=0){const cp=[...up[c]];cp[i]={...cp[i],payments:[...cp[i].payments,{id:eid,date:today(),category:orig.category,amount:-orig.amount,mode:orig.mode,note:"Reversal",timestamp:Date.now()}]};up[c]=cp;ctx.setStudents(up)}}}
    ctx.addAudit("REVERSAL",`Reversed ${orig.entry_id.slice(0,8)} (${N(orig.amount)} — ${orig.student||orig.note||"expense"})`,ctx.session?.name);
    ctx.addNotif(`Reversal posted: ${N(orig.amount)} for ${orig.student||orig.note||"expense entry"}.`);
    setRId("");setShowR(false);setMsg({t:0,m:"Reversal posted."});setTimeout(()=>setMsg(null),3e3);
  }
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:16}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Daily Cash Book — Section {sec}</h2>
      <div style={{fontFamily:"var(--ff-m)",fontSize:".78rem",background:"var(--card)",border:"1px solid var(--border)",padding:"6px 14px",borderRadius:20,boxShadow:"var(--sh)"}}>Liquidity: <strong style={{color:liq>=0?"var(--green)":"var(--red)"}}>{N(liq)}</strong></div>
    </div>
    {msg&&<div className={msg.t?"msg-err":"msg-ok"}>{msg.m}</div>}
    
    <div className="card"><div className="sect">New Entry</div>
      <div className="gf2">
        <div className="fl"><span className="flb">Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="inp"/></div>
        <div className="fl"><span className="flb">Entry Type</span>
          <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:"1.5px solid var(--border)"}}>
            {["Income","Expense"].map(t=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",border:"none",cursor:"pointer",fontWeight:type===t?700:400,fontSize:".8rem",background:type===t?(t==="Income"?"var(--green)":"var(--red)"):"#fff",color:type===t?"#fff":"var(--muted)",transition:"all .15s"}}>{t}</button>)}
          </div>
        </div>
        {isExpense?<>
          <div className="fl" style={{gridColumn:"span 2"}}><span className="flb">What is this expense for?</span><input value={desc} onChange={e=>setDesc(e.target.value)} className="inp" placeholder="e.g. chalk, fuel, stationery, drawings (proprietor withdrawal)…"/></div>
          <div className="fl"><span className="flb">Amount (₦)</span><input type="number" min="0" step=".01" value={amt} onChange={e=>setAmt(e.target.value)} className="inpm" placeholder="0.00"/></div>
          <div className="fl"><span className="flb">Payment Mode</span><select value={mode} onChange={e=>setMode(e.target.value)} className="sel">{PAY_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
        </>:<>
          <div className="fl"><span className="flb">Class</span><select value={cl} onChange={e=>{setCl(e.target.value);setStu("")}} className="sel"><option value="">— Select class —</option>{classes.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="fl"><span className="flb">Student</span><select value={stu} onChange={e=>setStu(e.target.value)} className="sel" disabled={!cl}><option value="">— Select student —</option>{stuList.map(n=><option key={n}>{n}</option>)}</select>{cl&&stuList.length===0&&<span className="hint">No students — sync or import via Class Portal</span>}</div>
          <div className="fl"><span className="flb">Fee Category</span><select value={cat} onChange={e=>setCat(e.target.value)} className="sel"><option value="">— Select category —</option>{activeCats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="fl"><span className="flb">Amount (₦)</span><input type="number" min="0" step=".01" value={amt} onChange={e=>setAmt(e.target.value)} className="inpm" placeholder="0.00"/></div>
          <div className="fl"><span className="flb">Payment Mode</span><select value={mode} onChange={e=>setMode(e.target.value)} className="sel">{PAY_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
        </>}
      </div>
      {isExpense&&<div className="msg-warn" style={{marginTop:10,marginBottom:0}}>⚠ Expenses are recorded against the school account — no student or class required. Use clear descriptions for audit purposes.</div>}
      <div className="fr" style={{marginTop:14}}>
        <button className="btn btn-gold" onClick={submit} disabled={saving}>{saving?"Saving…":isExpense?"RECORD EXPENSE":"SUBMIT INCOME"}</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowR(!showR)}>{showR?"Cancel":"⤺ Post Reversal"}</button>
      </div>
      {showR&&<div style={{marginTop:12,padding:14,background:"var(--redbg)",border:"1px dashed var(--red)",borderRadius:8}}>
        <div className="fl" style={{marginBottom:10}}><span className="flb">Original Entry ID</span><input value={rId} onChange={e=>setRId(e.target.value)} className="inpm" placeholder="Paste entry_id to reverse"/></div>
        <button className="btn btn-red btn-sm" onClick={doRev}>CONFIRM REVERSAL</button>
      </div>}
    </div>
    
    <div className="card">
      <div className="fb" style={{marginBottom:12}}><div className="sect" style={{marginBottom:0}}>Ledger View</div><input type="date" value={fd} onChange={e=>setFd(e.target.value)} className="inp" style={{width:155}}/></div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        {[["Opening Balance",op,liq>=0?"var(--navy)":"var(--red)"],["Closing Balance",clBal,clBal>=0?"var(--green)":"var(--red)"],["Day of Week",dayN(fd),"var(--navy)"]].map(([l,v,c],i)=>
          <div key={i} style={{flex:1,minWidth:110,padding:"12px 14px",background:i===1?"var(--navy)":"var(--card)",border:"1px solid var(--border)",borderRadius:8,textAlign:"center",boxShadow:"var(--sh)"}}>
            <div style={{fontSize:".62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:i===1?"rgba(255,255,255,.6)":"var(--muted)"}}>{l}</div>
            <div style={{fontFamily:"var(--ff-m)",fontSize:".95rem",fontWeight:700,marginTop:5,color:i===1?"var(--gold)":typeof v==="number"?(v<0?"var(--red)":c):"var(--navy)"}}>{typeof v==="number"?N(v):v}</div>
          </div>)}
      </div>
      <div className="tw"><table><thead><tr><th>ID</th><th>Time</th><th>Student / Description</th><th>Class</th><th>Category</th><th>Mode</th><th className="r">Income</th><th className="r">Expense</th><th className="r">Balance</th><th>Note</th></tr></thead>
      <tbody>
        {dayE.length===0&&<tr><td colSpan={10} className="er">No entries for {fmtD(fd)}</td></tr>}
        {dayE.map((e,i)=>{let rb=op;for(let j=0;j<=i;j++)rb+=dayE[j].entry_type==="Income"?dayE[j].amount:-dayE[j].amount;
          const isExp=e.entry_type==="Expense"&&!e.reversal_of;
          return<tr key={e.entry_id} className={e.reversed?"rvd":e.reversal_of?"rvr":""}>
            <td className="mn">{e.entry_id.slice(0,8)}</td>
            <td>{new Date(e.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td>
            <td style={{fontWeight:500}}>{isExp?<span style={{fontStyle:"italic",color:"var(--red)"}}>{e.note||e.student||"Expense"}</span>:e.student}</td>
            <td>{isExp?<span className="badge bdr" style={{fontSize:".6rem"}}>EXPENSE</span>:e.class_name}</td>
            <td>{isExp?"":e.category}{e.is_prior_term?" ⏮":""}</td>
            <td><span className="badge" style={{background:"var(--bg2)",color:"var(--slate)",border:"1px solid var(--border)"}}>{e.mode}</span></td>
            <td className="my">{e.entry_type==="Income"?N(e.amount):""}</td>
            <td className="mr">{e.entry_type==="Expense"?N(e.amount):""}</td>
            <td style={{fontFamily:"var(--ff-m)",textAlign:"right",fontWeight:700,color:rb>=0?"var(--green)":"var(--red)"}}>{N(rb)}</td>
            <td style={{fontSize:".75rem",color:"var(--muted)"}}>{e.reversed?"REVERSED":e.note||""}</td>
          </tr>;})}
      </tbody></table></div>
    </div>
  </div>
  );
}

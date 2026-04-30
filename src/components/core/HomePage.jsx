import React from 'react';
import { useApp } from '../../context/AppContext';
import { today, N } from '../../utils/helpers';
import { ALL_CLS } from '../../constants';

export default function HomePage({sec,setTab}){
  const ctx=useApp();
  const isAdmin=ctx.session?.role==="admin"||ctx.session?.role==="superadmin";
  const role=ctx.session?.role;
  const td=today();
  const todayE=(ctx.cashBook||[]).filter(e=>e.date===td);
  const todayInc=todayE.filter(e=>e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
  const todayExp=todayE.filter(e=>e.entry_type==="Expense"&&!e.reversal_of).reduce((s,e)=>s+e.amount,0);
  const todayCnt=todayE.filter(e=>e.entry_type==="Income"&&!e.reversed).length;
  const unread=(ctx.notifs||[]).filter(n=>!n.read).length;
  const tStu=ALL_CLS.reduce((s,c)=>(ctx.students[c]||[]).length+s,0);
  const liq=(ctx.cashBook||[]).reduce((s,e)=>s+(e.entry_type==="Income"?e.amount:-e.amount),0);
  const dow=new Date().toLocaleDateString("en-US",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  
  const bTasks=[
    {done:todayCnt>0,text:"Record today's fee collections in the Cash Book",go:()=>setTab("cashbook")},
    {done:false,text:"Verify student ledgers are up to date",go:()=>setTab("ledgers")},
    {done:false,text:"Check payment analysis for students owing",go:()=>setTab("analysis")},
    {done:false,text:"Record Thursday lesson collections if applicable",go:()=>setTab("lessons")},
  ];
  
  const sysCards=[
    {i:"📒",t:"Daily Cash Book",d:"The single source of truth. All income and expenses recorded here. Corrections via reversal only — entries are immutable.",tag:"Sec A & B"},
    {i:"👤",t:"Student Ledgers",d:"Auto-populated from Cash Book. View per-student payment history and print official Tuition Fee receipts.",tag:"Read-only"},
    {i:"📋",t:"Payment Analysis",d:"Per-class breakdown by fee category. See completed vs. owing students with exact amounts.",tag:"Sec A & B"},
    {i:"📅",t:"Lesson Portal",d:"Fully isolated from the Cash Book. Thursday lesson collections, teacher share, and proprietor split.",tag:"Isolated Ledger"},
    ...(isAdmin?[
      {i:"📊",t:"Dashboard",d:"Live snapshot: income, expenses, liquidity, and collection breakdown by class.",tag:"Admin only"},
      {i:"🏦",t:"Accounting",d:"Full P&L, section-by-section analysis, payroll, lesson revenue, and audit integrity checks.",tag:"Admin only"},
      {i:"🔐",t:"User Management",d:"Create and manage Bursar accounts. Assign PINs and control section access.",tag:"Admin only"},
    ]:[]),
  ];
  
  return(
  <div className="fu">
    <div className="h-hero">
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
        <img src={window.LOGO_200} alt="School Logo" style={{width:80,height:80,objectFit:"contain",flexShrink:0,filter:"drop-shadow(0 2px 8px rgba(0,0,0,.4))"}}/>
        <div>
          <div style={{fontFamily:"var(--ff-d)",fontSize:"1.3rem",color:"var(--gold2)",fontWeight:700,lineHeight:1.2}}>Way to Success Standard Schools</div>
          <div style={{fontSize:".72rem",color:"rgba(255,255,255,.45)",marginTop:4}}>Ifedapo Community, Ejigbo · Est. 2017</div>
          <div style={{fontSize:".68rem",color:"rgba(255,255,255,.3)",marginTop:2}}>{dow}</div>
        </div>
      </div>
      <div style={{fontFamily:"var(--ff-d)",fontSize:".9rem",color:"rgba(255,255,255,.7)",marginTop:4}}>
        Welcome back, <span style={{color:"var(--gold2)",fontStyle:"normal",fontWeight:700}}>{ctx.session?.name}</span>
      </div>
      <div style={{marginTop:6,fontSize:".7rem",color:"rgba(255,255,255,.35)"}}>{role==="bursarA"?"Section A — Bursar":role==="bursarB"?"Section B — Bursar":role==="superadmin"?"Super Administrator":"Administrator"}</div>
    </div>
    
    <div className="kg">
      <div className="kpi" style={{"--accent":"var(--green)"}}><div className="kl">Today's Income</div><div className="kv" style={{color:"var(--green)"}}>{N(todayInc)}</div><div className="ksub">{todayCnt} transaction{todayCnt!==1?"s":""}</div></div>
      <div className="kpi" style={{"--accent":"var(--red)"}}><div className="kl">Today's Expenses</div><div className="kv" style={{color:"var(--red)"}}>{N(todayExp)}</div><div className="ksub">{td}</div></div>
      {isAdmin&&<div className="kpi" style={{"--accent":"var(--navy)"}}><div className="kl">Live Liquidity</div><div className="kv" style={{color:liq>=0?"var(--green)":"var(--red)"}}>{N(liq)}</div><div className="ksub">All sections combined</div></div>}
      {isAdmin&&<div className="kpi" style={{"--accent":"var(--amber)"}}><div className="kl">Unread Alerts</div><div className="kv" style={{color:unread>0?"var(--red)":"var(--green)"}}>{unread}</div><div className="ksub">{tStu} total students</div></div>}
    </div>
    
    <div className="card">
      <div className="sect">📋 How This System Works</div>
      {sysCards.map(({i,t,d,tag})=><div key={t} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border2)"}}>
        <div style={{fontSize:"1.1rem",width:26,textAlign:"center",flexShrink:0,marginTop:1}}>{i}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:".84rem",color:"var(--ink)"}}>{t} <span className="badge bdn" style={{fontSize:".54rem",verticalAlign:"middle"}}>{tag}</span></div>
          <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2,lineHeight:1.5}}>{d}</div>
        </div>
      </div>)}
    </div>
    
    {!isAdmin&&<div className="card">
      <div className="sect">✅ Daily Checklist — {role==="bursarA"?"Section A":"Section B"} Bursar</div>
      {bTasks.map((t,i)=><div key={i} className="h-task">
        <div className="h-ck">{t.done?"✓":""}</div>
        <div style={{flex:1,fontSize:".84rem",fontWeight:t.done?400:600,color:t.done?"var(--muted)":"var(--ink)",textDecoration:t.done?"line-through":"none"}}>{t.text}</div>
        <button className="btn btn-ghost btn-xs" onClick={t.go}>Go →</button>
      </div>)}
    </div>}
    
    {isAdmin&&<div className="card">
      <div className="sect">⚡ Quick Actions</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[["📒 Cash Book A","cashbook"],["📒 Cash Book B","cashbook"],["📊 Dashboard","dash"],["🏦 Accounting","acct"],["🔐 Users","users"],["⚙️ Settings","set"]].map(([l,t])=><button key={l} className="btn btn-outline btn-sm" onClick={()=>setTab(t)}>{l}</button>)}
      </div>
    </div>}
    
    {isAdmin&&unread>0&&<div className="card" style={{borderTop:"3px solid var(--red)"}}>
      <div className="sect">🔔 Unread Alerts ({unread})</div>
      {(ctx.notifs||[]).filter(n=>!n.read).slice(0,4).map(n=><div key={n.nid} style={{padding:"8px 0",borderBottom:"1px solid var(--border2)",fontSize:".8rem"}}>
        <div style={{fontWeight:600}}>{n.type==="error"?"🚨":"⚠️"} {n.msg}</div>
        <div style={{fontSize:".66rem",color:"var(--muted)",marginTop:2}}>{new Date(n.time).toLocaleString()}</div>
      </div>)}
    </div>}
    <div className="msg-info">ℹ <strong>Audit Integrity:</strong> Cash Book entries are immutable. Use "Post Reversal" to correct errors — this creates a counter-entry preserving the full audit trail.</div>
  </div>
  );
}

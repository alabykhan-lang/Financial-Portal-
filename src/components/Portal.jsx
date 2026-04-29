import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { sbPA } from '../utils/api';
import { SS } from '../utils/helpers';
import HomePage from './HomePage';
import CashBook from './CashBook';
import ClassPortal from './ClassPortal';
import Ledgers from './Ledgers';
import Analysis from './Analysis';
import Lessons from './Lessons';
import Dash from './Dash';
import Acct from './Acct';
import Sal from './Sal';
import ExamPortal from './ExamPortal';
import UserMgmt from './UserMgmt';
import Settings from './Settings';

function NPanel({close}){
  const{notifs,setNotifs}=useApp();
  const mr=id=>{const u=(notifs||[]).map(n=>n.nid===id?{...n,read:true}:n);setNotifs(u);try{sbPA("ssfp_notifications",`nid=eq.${id}`,{read:true})}catch{}};
  return<div className="npanel np">
    <div style={{padding:"10px 16px",fontWeight:700,borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:".82rem",color:"var(--navy)"}}>
      <span>Alerts & Notifications</span><button onClick={close} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)"}}>✕</button>
    </div>
    {(!notifs||notifs.length===0)&&<div className="er">No alerts</div>}
    {(notifs||[]).slice(0,30).map(n=><div key={n.nid} className={"ni"+(n.read?"":" ur")} onClick={()=>mr(n.nid)}>
      <div style={{fontWeight:n.read?400:600,color:"var(--ink)"}}>{n.type==="error"?"🚨":"⚠️"} {n.msg}</div>
      <div style={{fontSize:".66rem",color:"var(--muted)",marginTop:3}}>{new Date(n.time).toLocaleString()}</div>
    </div>)}
  </div>;
}

export default function Portal(){
  const{session,setSession,notifs,setNotifs,dbOk,syncMsg,refreshStudents,addAudit,runAIAudit,dbWriteErr,setDbWriteErr}=useApp();
  const isAdmin=session?.role==="admin"||session?.role==="superadmin";
  const isProp=session?.isProp||false;const isSuper=session?.isSuper||false;const role=session?.role;
  const[tab,setTabRaw]=useState(()=>SS.g("ssfp_tab","home"));
  const[sec,setSecRaw]=useState(()=>SS.g("ssfp_sec",session?.section==="B"?"B":"A"));
  const[tabHistory,setTabHistory]=useState(["home"]);
  
  const setTab=t=>{setTabRaw(t);SS.s("ssfp_tab",t);setTabHistory(h=>{const last=h[h.length-1];return last===t?h:[...h.slice(-9),t]});};
  const goBack=()=>{setTabHistory(h=>{if(h.length<=1)return h;const nh=h.slice(0,-1);const prev=nh[nh.length-1];setTabRaw(prev);SS.s("ssfp_tab",prev);return nh;});};
  const setSec=s=>{setSecRaw(s);SS.s("ssfp_sec",s)};
  const[open,setOpen]=useState(false);const[showN,setShowN]=useState(false);
  const ur=(notifs||[]).filter(n=>!n.read).length;
  const effSec=role==="bursarA"?"A":role==="bursarB"?"B":sec;
  
  const navSections=useMemo(()=>{
    const bTabs=s=>[{id:"home",l:"Home",i:"🏠"},{id:"cashbook",l:`Cash Book — Sec ${s}`,i:"📒"},{id:"classes",l:`Class Portal — Sec ${s}`,i:"🏫"},{id:"ledgers",l:`Ledgers — Sec ${s}`,i:"👤"},{id:"analysis",l:`Analysis — Sec ${s}`,i:"📋"},{id:"lessons",l:"Lesson Portal",i:"📅"}];
    const aTabs=[{id:"home",l:"Home",i:"🏠"},{id:"dash",l:"Dashboard",i:"📊"},{id:"cashbook",l:"Cash Book",i:"📒"},{id:"classes",l:"Class Portal",i:"🏫"},{id:"ledgers",l:"Student Ledgers",i:"👤"},{id:"analysis",l:"Payment Analysis",i:"📋"},{id:"lessons",l:"Lesson Portal",i:"📅"},{id:"acct",l:"Accounting",i:"🏦"},{id:"sal",l:"Salaries",i:"💰"},{id:"exam",l:"Ext. Exams",i:"📝"},{id:"users",l:"User Management",i:"🔐"},{id:"set",l:"Settings",i:"⚙️"}];
    if(isAdmin)return[{label:"MAIN MENU",items:aTabs}];
    if(role==="bursarA")return[{label:"SECTION A — BURSAR",items:bTabs("A")}];
    if(role==="bursarB")return[{label:"SECTION B — BURSAR",items:bTabs("B")}];
    return[{label:"PORTAL",items:bTabs(sec)}];
  },[isAdmin,role,sec]);
  
  const roleLabel=isSuper?"Super Administrator":isProp?"Administrator":role==="admin"?"Administrator":role==="bursarA"?"Bursar — Section A":role==="bursarB"?"Bursar — Section B":"Staff";
  const initials=(session?.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const pageTitle={home:"Home",cashbook:"Daily Cash Book",classes:"Class Portal",ledgers:"Student Ledgers",analysis:"Payment Analysis",lessons:"Lesson Portal",dash:"Dashboard",acct:"Financial Accounting",sal:"Salaries",exam:"External Exams",users:"User Management",set:"Settings"}[tab]||"";
  
  function logout(){
    // Superadmin exits silently — no audit trace, no logout notification
    if(!isProp&&!isSuper&&session?.name)addAudit("LOGOUT",`${session.name} logged out`,session.name);
    setSession(null);
    try{sessionStorage.removeItem("ssfp_tab");sessionStorage.removeItem("ssfp_sec");sessionStorage.removeItem("ssfp_sess")}catch{}
  }
  
  return(
  <div className="pl">
    <div className={"sb-ov"+(open?"":" h")} onClick={()=>setOpen(false)}/>
    <aside className={"sb np"+(open?" open":"")}>
      <div className="sb-hd">
        <div className="sb-lw">
          <div className="sb-logo"><img src={window.LOGO_80} alt="Logo"/></div>
          <div>
            <div className="sb-nm">Way to Success</div>
            <div className="sb-tg">Standard Schools · Ejigbo</div>
          </div>
        </div>
        <div className="sb-rp">{roleLabel}</div>
      </div>
      <nav className="sb-nav">
        {navSections.map(s=><div key={s.label}>
          <div className="sb-lbl">{s.label}</div>
          {s.items.map(item=><div key={item.id} className={"ni2"+(tab===item.id?" act":"")} onClick={()=>{setTab(item.id);setOpen(false)}}>
            <span className="ni2-ic">{item.i}</span><span>{item.l}</span>
          </div>)}
        </div>)}
      </nav>
      <div className="sb-ft">
        <div className="sb-usr">
          <div className="sb-av">{initials}</div>
          <span className="sb-un">{session?.name||"User"}</span>
          {isAdmin&&<div style={{display:"flex",gap:4}}>
            <div style={{position:"relative"}}><button className="ib" style={{padding:"4px 7px"}} onClick={()=>setShowN(o=>!o)}>🔔{ur>0&&<span className="nd"/>}</button></div>
            <button className="ib" style={{padding:"4px 7px"}} title="Run AI Audit & Anomaly Detection" onClick={async()=>{await runAIAudit();}}><span style={{fontSize:".6rem",color:"var(--gold)"}}>✦AI</span></button>
          </div>}
        </div>
        <button className="sb-lo" onClick={logout}>Sign Out</button>
      </div>
    </aside>
    <div className="pm">
      <header className="ptb np">
        <button className="hbg" onClick={()=>setOpen(o=>!o)}>☰</button>
        {tabHistory.length>1&&<button className="hbg" onClick={goBack} title="Go back" style={{fontSize:"1rem"}}>←</button>}
        <span className="ptitle">{pageTitle}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {isAdmin&&<div className="stg">{["A","B"].map(s=><button key={s} className={"stb"+(sec===s?" a":"")} onClick={()=>setSec(s)}>Sec {s}</button>)}</div>}
          <button className="ib" onClick={refreshStudents} title="Sync">↻</button>
        </div>
      </header>
      {showN&&<NPanel close={()=>setShowN(false)}/>}
      {dbWriteErr&&<div style={{background:"#dc2626",color:"#fff",padding:"10px 18px",fontSize:".78rem",fontWeight:600,display:"flex",alignItems:"center",gap:10,position:"sticky",top:56,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
        <span style={{fontSize:"1.1rem"}}>⚠</span>
        <span style={{flex:1}}>{dbWriteErr}</span>
        <button onClick={()=>setDbWriteErr(null)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:4,padding:"3px 10px",cursor:"pointer",fontSize:".76rem"}}>✕</button>
      </div>}
      <main className="pc">
        {tab==="home"&&<HomePage sec={effSec} setTab={setTab}/>}
        {tab==="cashbook"&&<CashBook sec={effSec}/>}
        {tab==="classes"&&<ClassPortal sec={effSec}/>}
        {tab==="ledgers"&&<Ledgers sec={effSec}/>}
        {tab==="analysis"&&<Analysis sec={effSec}/>}
        {tab==="lessons"&&<Lessons sec={effSec}/>}
        {tab==="dash"&&isAdmin&&<Dash sec={effSec}/>}
        {tab==="acct"&&isAdmin&&<Acct/>}
        {tab==="sal"&&isAdmin&&<Sal/>}
        {tab==="exam"&&isAdmin&&<ExamPortal/>}
        {tab==="users"&&isAdmin&&<UserMgmt/>}
        {tab==="set"&&isAdmin&&<Settings/>}
      </main>
    </div>
  </div>
  );
}

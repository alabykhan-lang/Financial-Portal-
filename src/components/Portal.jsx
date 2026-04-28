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

export default function Portal(){
  const{session,setSession,dbOk,syncMsg,refreshStudents,addAudit,runAIAudit,dbWriteErr,setDbWriteErr}=useApp();
  const isAdmin=session?.role==="admin"||session?.role==="superadmin";
  const[tab,setTabRaw]=useState(()=>SS.g("ssfp_tab","home"));
  const[sec,setSecRaw]=useState(()=>SS.g("ssfp_sec",session?.section==="B"?"B":"A"));
  
  const setTab=t=>{setTabRaw(t);SS.s("ssfp_tab",t)};
  const setSec=s=>{setSecRaw(s);SS.s("ssfp_sec",s)};
  const[open,setOpen]=useState(false);
  const effSec=session?.role==="bursarA"?"A":session?.role==="bursarB"?"B":sec;
  
  const navItems=useMemo(()=>{
    const base=[{id:"home",l:"Home",i:"🏠"},{id:"cashbook",l:"Cash Book",i:"📒"},{id:"classes",l:"Class Portal",i:"🏫"},{id:"ledgers",l:"Student Ledgers",i:"👤"},{id:"analysis",l:"Analysis",i:"📋"},{id:"lessons",l:"Lesson Portal",i:"📅"}];
    if(isAdmin)return[...base,{id:"dash",l:"Dashboard",i:"📊"},{id:"acct",l:"Accounting",i:"🏦"},{id:"sal",l:"Salaries",i:"💰"},{id:"exam",l:"Ext. Exams",i:"📝"},{id:"users",l:"User Management",i:"🔐"},{id:"set",l:"Settings",i:"⚙️"}];
    return base;
  },[isAdmin]);

  return(
  <div className="pl">
    <aside className={"sb"+(open?" open":"")}>
      <div className="sb-hd">
        <div className="sb-lw">
          <div className="sb-logo"><img src={window.LOGO_80} alt="Logo"/></div>
          <div className="sb-nm">Way to Success</div>
        </div>
      </div>
      <nav className="sb-nav">
        {navItems.map(item=><div key={item.id} className={"ni2"+(tab===item.id?" act":"")} onClick={()=>setTab(item.id)}>
          <span className="ni2-ic">{item.i}</span><span>{item.l}</span>
        </div>)}
      </nav>
      <div className="sb-ft">
        <button className="sb-lo" onClick={()=>setSession(null)}>Sign Out</button>
      </div>
    </aside>
    <div className="pm">
      <header className="ptb">
        <button className="hbg" onClick={()=>setOpen(!open)}>☰</button>
        <span className="ptitle">{tab.toUpperCase()}</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {isAdmin&&<div className="stg">{["A","B"].map(s=><button key={s} className={"stb"+(sec===s?" a":"")} onClick={()=>setSec(s)}>Sec {s}</button>)}</div>}
          <button className="ib" onClick={refreshStudents}>↻</button>
        </div>
      </header>
      <main className="pc">
        {tab==="home"&&<HomePage sec={effSec} setTab={setTab}/>}
        {tab==="cashbook"&&<CashBook sec={effSec}/>}
        {tab==="classes"&&<ClassPortal sec={effSec}/>}
        {tab==="ledgers"&&<Ledgers sec={effSec}/>}
        {tab==="analysis"&&<Analysis sec={effSec}/>}
        {tab==="lessons"&&<Lessons sec={effSec}/>}
        {tab==="dash"&&<Dash sec={effSec}/>}
        {tab==="acct"&&<Acct/>}
        {tab==="sal"&&<Sal/>}
        {tab==="exam"&&<ExamPortal/>}
        {tab==="users"&&<UserMgmt/>}
        {tab==="set"&&<Settings/>}
      </main>
    </div>
  </div>
  );
}

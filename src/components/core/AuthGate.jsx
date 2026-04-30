import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sbG, sbPA } from '../../utils/api';
import { SCHOOL_NAME, SUPER_USER, SUPER_PASS, PROP_USER } from '../../constants';
import { hashPin, checkPropPin, LS } from '../../utils/helpers';

export default function AuthGate(){
  const{setSession,dbOk,syncMsg,addAudit}=useApp();
  const[step,setStep]=useState("user");const[uname,setUname]=useState("");const[pin,setPin]=useState("");const[superPass,setSuperPass]=useState("");const[users,setUsers]=setUsers([]);const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const[shk,setShk]=useState(0);
  const isSuperInput=uname.trim().toLowerCase()===SUPER_USER;
  
  useEffect(()=>{(async()=>{try{const r=await sbG("ssfp_users","is_active=eq.true&order=name.asc");setUsers(r)}catch{setUsers(LS.g("ssfp_users",[]))}})()},[]);
  
  async function nextStep(){const u=uname.trim().toLowerCase();if(!u){setErr("Enter your username.");return}if(u===SUPER_USER||u===PROP_USER){setStep("pin");setErr("");return}const found=users.find(x=>x.username.toLowerCase()===u);if(!found){setErr("Username not found. Contact admin.");setShk(k=>k+1);return}if(!found.is_active){setErr("Account is disabled.");return}setStep("pin");setErr("")}
  
  function digit(d){if(pin.length>=6)return;const np=pin+d;setPin(np);if(np.length===6)setTimeout(()=>verify(np),80)}
  function del(){setPin(p=>p.slice(0,-1))}
  
  async function verifySuperPass(){if(superPass===SUPER_PASS){setSession({user:SUPER_USER,role:"superadmin",section:"both",name:"Admin",isProp:false,isSuper:true});return}setErr("Incorrect credentials.");setSuperPass("");setShk(k=>k+1)}
  
  async function verify(p){
    setLoading(true);setErr("");const u=uname.trim().toLowerCase();
    try{
      if(u===PROP_USER){const ok=await checkPropPin(p);if(ok){setSession({user:PROP_USER,role:"admin",section:"both",name:"Admin",isProp:true,isSuper:false});return}else{setErr("Incorrect PIN.");setPin("");setShk(k=>k+1);setLoading(false);return}}
      const found=users.find(x=>x.username.toLowerCase()===u);if(!found){setErr("User not found.");setPin("");setLoading(false);return}
      const h=await hashPin(p,u);if(h!==found.pin_hash){setErr("Incorrect PIN.");setPin("");setShk(k=>k+1);setLoading(false);return}
      const loginTime=new Date().toISOString();
      try{await sbPA("ssfp_users",`uid=eq.${found.uid}`,{last_seen:loginTime,login_count:(found.login_count||0)+1})}catch{}
      const up=users.map(x=>x.uid===found.uid?{...x,last_seen:loginTime,login_count:(x.login_count||0)+1}:x);setUsers(up);LS.s("ssfp_users",up);
      setSession({user:found.username,role:found.role,section:found.section,name:found.name,isProp:false,isSuper:false});
      addAudit("LOGIN",`${found.name} logged in`,found.name);
    }catch(e){setErr("Error. Try again.");setPin("");}
    setLoading(false);
  }
  
  return(
    <div className="login-bg">
      <div className="login-card fu">
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
          <img src={window.LOGO_200} alt="School Logo" style={{width:120,height:120,objectFit:"contain",marginBottom:10}}/>
          <div style={{fontFamily:"var(--ff-d)",fontSize:"1.1rem",color:"var(--navy)",fontWeight:700,textAlign:"center",lineHeight:1.3}}>{SCHOOL_NAME}</div>
          <div style={{fontSize:".72rem",color:"var(--muted)",textAlign:"center",marginTop:4,letterSpacing:.3}}>Finance Management Portal</div>
        </div>
        {step==="user"&&<div key={"u"+shk} className={shk?"shake":""}>
          <div className="fl" style={{marginBottom:12}}>
            <span className="flb">Username</span>
            <input className="inp" value={uname} onChange={e=>setUname(e.target.value)} placeholder="Enter your username" autoFocus onKeyDown={e=>e.key==="Enter"&&nextStep()} style={{textAlign:"center",fontFamily:"var(--ff-m)"}}/>
          </div>
          {err&&<div className="msg-err">⚠ {err}</div>}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={nextStep}>CONTINUE →</button>
        </div>}
        {step==="pin"&&isSuperInput&&<div key={"sp"+shk} className={shk?"shake":""}>
          <p style={{fontSize:".78rem",color:"var(--muted)",textAlign:"center",marginBottom:12}}>Enter access password</p>
          <div className="fl" style={{marginBottom:12}}>
            <input type="password" className="inp" value={superPass} onChange={e=>setSuperPass(e.target.value)} placeholder="Password" autoFocus onKeyDown={e=>e.key==="Enter"&&verifySuperPass()} style={{textAlign:"center",fontFamily:"var(--ff-m)"}}/>
          </div>
          {err&&<div className="msg-err" style={{marginBottom:8}}>⚠ {err}</div>}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginBottom:8}} onClick={verifySuperPass}>SIGN IN</button>
          <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setStep("user");setSuperPass("");setErr("")}}>← Back</button>
        </div>}
        {step==="pin"&&!isSuperInput&&<div>
          <p style={{fontSize:".78rem",color:"var(--muted)",textAlign:"center",marginBottom:4}}>Enter your 6-digit PIN</p>
          <p style={{fontFamily:"var(--ff-m)",fontSize:".85rem",fontWeight:700,color:"var(--navy)",textAlign:"center",marginBottom:8}}>{uname}</p>
          <div key={"p"+shk} className={shk?"pin-dots shake":"pin-dots"}>{[0,1,2,3,4,5].map(i=><div key={i} className={"pin-dot"+(i<pin.length?" f":"")}/>)}</div>
          {err&&<div className="msg-err" style={{marginBottom:8}}>⚠ {err}</div>}
          {loading?<div style={{textAlign:"center",padding:16,color:"var(--muted)",fontSize:".8rem"}}>Verifying…</div>:<>
            <div className="pin-pad">{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=><button key={i} className="pin-btn" onClick={()=>d==="⌫"?del():d!==""&&digit(d.toString())} style={{opacity:d===""?0:1,cursor:d===""?"default":"pointer"}}>{d}</button>)}</div>
            <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:12,justifyContent:"center"}} onClick={()=>{setStep("user");setPin("");setErr("")}}>← Back</button>
          </>}
        </div>}
      </div>
    </div>
  );
}

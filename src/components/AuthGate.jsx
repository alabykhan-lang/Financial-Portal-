import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sbG, sbPA } from '../utils/api';
import { SCHOOL_NAME, SUPER_USER, SUPER_PASS, PROP_USER } from '../constants';
import { hashPin, checkPropPin, LS } from '../utils/helpers';

export default function AuthGate(){
  const{setSession,dbOk,syncMsg,addAudit}=useApp();
  const[step,setStep]=useState("user");const[uname,setUname]=useState("");const[pin,setPin]=useState("");const[superPass,setSuperPass]=useState("");const[users,setUsers]=useState([]);const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const[shk,setShk]=useState(0);
  const isSuperInput=uname.trim().toLowerCase()===SUPER_USER;
  
  useEffect(()=>{(async()=>{try{const r=await sbG("ssfp_users","is_active=eq.true&order=name.asc");setUsers(r)}catch{setUsers(LS.g("ssfp_users",[]))}})()},[]);
  
  async function nextStep(){const u=uname.trim().toLowerCase();if(!u){setErr("Enter your username.");return}if(u===SUPER_USER||u===PROP_USER){setStep("pin");setErr("");return}const found=users.find(x=>x.username.toLowerCase()===u);if(!found){setErr("Username not found. Contact admin.");setShk(k=>k+1);return}setStep("pin");setErr("")}
  
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
        {step==="user"&&<div>
          <div className="fl" style={{marginBottom:12}}>
            <span className="flb">Username</span>
            <input className="inp" value={uname} onChange={e=>setUname(e.target.value)} placeholder="Enter your username" style={{textAlign:"center"}}/>
          </div>
          {err&&<div className="msg-err">⚠ {err}</div>}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={nextStep}>CONTINUE →</button>
        </div>}
        {step==="pin"&&!isSuperInput&&<div>
          <div className="pin-dots">{[0,1,2,3,4,5].map(i=><div key={i} className={"pin-dot"+(i<pin.length?" f":"")}/>)}</div>
          {err&&<div className="msg-err">⚠ {err}</div>}
          <div className="pin-pad">{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=><button key={i} className="pin-btn" onClick={()=>d==="⌫"?del():d!==""&&digit(d.toString())}>{d}</button>)}</div>
        </div>}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PROP_USER, SUPER_USER } from '../constants';
import { sbG, sbU, sbPA } from '../utils/api';
import { uid, hashPin, LS } from '../utils/helpers';

export default function UserMgmt(){
  const{session,addAudit}=useApp();
  const[users,setUsers]=useState([]);
  const[form,setForm]=useState({name:"",username:"",role:"bursarA",section:"A",pin:"",pin2:""});
  const[msg,setMsg]=useState(null);
  const[loading,setLoading]=useState(true);
  
  useEffect(()=>{(async()=>{try{const r=await sbG("ssfp_users","order=name.asc");setUsers(r)}catch{setUsers(LS.g("ssfp_users",[]))}setLoading(false)})()},[]);
  
  async function addUser(){
    if(!form.name.trim()||!form.username.trim()||!form.pin){setMsg({t:1,m:"Fill name, username and PIN."});return}
    if(form.pin!==form.pin2){setMsg({t:1,m:"PINs do not match."});return}
    if(form.pin.length<4||!/^\d+$/.test(form.pin)){setMsg({t:1,m:"PIN must be 4+ digits."});return}
    if([PROP_USER,SUPER_USER].includes(form.username.trim().toLowerCase())){setMsg({t:1,m:"That username is reserved."});return}
    if(users.find(u=>u.username.toLowerCase()===form.username.trim().toLowerCase())){setMsg({t:1,m:"Username exists."});return}
    
    const hash=await hashPin(form.pin,form.username.trim().toLowerCase());
    // CRITICAL: created_at removed to match DB schema
    const nu={uid:uid(),name:form.name.trim(),username:form.username.trim().toLowerCase(),role:form.role,section:form.section,pin_hash:hash,is_active:true,last_seen:null,login_count:0};
    
    try{await sbU("ssfp_users",[nu])}catch(e){setMsg({t:1,m:"DB error: "+JSON.stringify(e)});return}
    
    const up=[...users,nu];setUsers(up);
    addAudit("ADD_USER",`Created ${nu.username} (${nu.role})`,session.name);
    setForm({name:"",username:"",role:"bursarA",section:"A",pin:"",pin2:""});
    
    try{const r=await sbG("ssfp_users","order=name.asc");setUsers(r)}catch{}
    setMsg({t:0,m:`✓ User "${nu.username}" created and saved to database.`});setTimeout(()=>setMsg(null),4e3);
  }
  
  async function toggle(id,active){
    try{await sbPA("ssfp_users",`uid=eq.${id}`,{is_active:active})}catch{}
    setUsers(p=>p.map(u=>u.uid===id?{...u,is_active:active}:u));
    addAudit(active?"ENABLE":"DISABLE",`User ${id}`,session.name)
  }
  
  async function resetPin(u){
    const p=prompt(`New PIN for ${u.name} (digits only):`);
    if(!p||!/^\d{4,8}$/.test(p)){alert("PIN must be 4-8 digits.");return}
    const h=await hashPin(p,u.username);
    try{await sbPA("ssfp_users",`uid=eq.${u.uid}`,{pin_hash:h})}catch{}
    setUsers(p2=>p2.map(x=>x.uid===u.uid?{...x,pin_hash:h}:x));
    addAudit("RESET_PIN",`PIN reset for ${u.username}`,session.name);
    alert("✓ PIN updated.")
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)",marginBottom:14}}>User Management</h2>
    {msg&&<div className={msg.t?"msg-err":"msg-ok"}>{msg.m}</div>}
    
    <div className="card"><div className="sect">Add Authorised User</div>
      <div className="gf2">
        <div className="fl"><span className="flb">Full Name</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="inp" placeholder="Staff full name"/></div>
        <div className="fl"><span className="flb">Username</span><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className="inp" placeholder="e.g. mrs.adeyemi"/></div>
        <div className="fl"><span className="flb">Role</span><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="sel"><option value="admin">Administrator</option><option value="bursarA">Bursar — Section A</option><option value="bursarB">Bursar — Section B</option></select></div>
        <div className="fl"><span className="flb">Section Access</span><select value={form.section} onChange={e=>setForm({...form,section:e.target.value})} className="sel"><option value="A">Section A</option><option value="B">Section B</option><option value="both">Both Sections</option></select></div>
        <div className="fl"><span className="flb">PIN (digits)</span><input type="password" inputMode="numeric" maxLength={8} value={form.pin} onChange={e=>setForm({...form,pin:e.target.value.replace(/\D/g,"")})} className="inp" placeholder="4–8 digit PIN"/></div>
        <div className="fl"><span className="flb">Confirm PIN</span><input type="password" inputMode="numeric" maxLength={8} value={form.pin2} onChange={e=>setForm({...form,pin2:e.target.value.replace(/\D/g,"")})} className="inp" placeholder="Repeat PIN"/></div>
      </div>
      <button className="btn btn-gold" style={{marginTop:14}} onClick={addUser}>CREATE USER</button>
      <p className="hint" style={{marginTop:6}}>PINs are SHA-256 hashed. Admin cannot view user PINs.</p>
    </div>
    
    <div className="card"><div className="sect">Registered Users</div>
      {loading?<p className="hint">Loading…</p>:<div className="tw"><table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Section</th><th>Last Login</th><th>Logins</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{users.length===0&&<tr><td colSpan={8} className="er">No users yet.</td></tr>}
      {users.map(u=><tr key={u.uid}><td style={{fontWeight:600}}>{u.name}</td><td className="mn">{u.username}</td>
        <td><span className={"badge "+(u.role==="admin"?"bdr":u.role==="bursarA"?"bdb":"bdg")}>{u.role}</span></td>
        <td style={{color:"var(--muted)"}}>{u.section}</td>
        <td className="mn" style={{fontSize:".68rem"}}>{u.last_seen?new Date(u.last_seen).toLocaleString():"Never"}</td>
        <td style={{fontFamily:"var(--ff-m)",textAlign:"center",color:"var(--muted)"}}>{u.login_count||0}</td>
        <td>{u.is_active?<span className="badge bdg">Active</span>:<span className="badge bdr">Disabled</span>}</td>
        <td><div style={{display:"flex",gap:5}}>
          <button className={"btn btn-sm "+(u.is_active?"btn-red":"btn-green")} onClick={()=>toggle(u.uid,!u.is_active)}>{u.is_active?"Disable":"Enable"}</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>resetPin(u)}>Reset PIN</button>
        </div></td>
      </tr>)}</tbody></table></div>}
    </div>
  </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sbG, sbU, sbPA } from '../utils/api';
import { uid, hashPin } from '../utils/helpers';

export default function UserMgmt(){
  const ctx=useApp();const[users,setUsers]=useState([]);
  const[f,setF]=useState({name:"",username:"",role:"bursarA",pin:""});
  
  useEffect(()=>{(async()=>{try{setUsers(await sbG("ssfp_users"))}catch{}})()},[]);
  
  async function addUser(){
    const hash=await hashPin(f.pin,f.username);
    const nu={uid:uid(),name:f.name,username:f.username,role:f.role,pin_hash:hash,is_active:true};
    await sbU("ssfp_users",[nu]);setUsers([...users,nu]);
  }
  
  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>User Management</h2>
    <div className="card"><div className="gf2"><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="inp" placeholder="Name"/><input value={f.username} onChange={e=>setF({...f,username:e.target.value})} className="inp" placeholder="Username"/><select value={f.role} onChange={e=>setF({...f,role:e.target.value})} className="sel"><option value="admin">Admin</option><option value="bursarA">Bursar A</option></select><input type="password" value={f.pin} onChange={e=>setF({...f,pin:e.target.value})} className="inp" placeholder="PIN"/></div><button className="btn btn-gold" style={{marginTop:12}} onClick={addUser}>CREATE</button></div>
    <div className="card"><div className="tw"><table><thead><tr><th>Name</th><th>User</th><th>Role</th></tr></thead><tbody>{users.map(u=><tr key={u.uid}><td>{u.name}</td><td>{u.username}</td><td>{u.role}</td></tr>)}</tbody></table></div></div>
  </div>
  );
}

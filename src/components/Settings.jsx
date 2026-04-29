import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SCHOOL_NAME, FEE_GROUPS, DEF_CATS, ALL_CLS, PROP_USER, PROP_PIN_KEY } from '../constants';
import { checkPropPin, hashPin, uid, today, fmtD, N, LS } from '../utils/helpers';

export default function Settings(){
  const ctx=useApp();
  const isProp=ctx.session?.isProp||ctx.session?.isSuper||false;
  const[nc,setNc]=useState("");const[msg,setMsg]=useState(null);const[saving,setSaving]=useState(false);
  const[localTargets,setLocalTargets]=useState(ctx.feeTargets||{});
  const[localProfile,setLocalProfile]=useState(ctx.schoolProfile||{});
  const[localAI,setLocalAI]=useState(ctx.aiConfig||{});
  const[selGrp,setSelGrp]=useState(FEE_GROUPS[0].label);
  const[dp,setDp]=useState({student:"",class_name:ALL_CLS[0],amount:""});
  const[sp,setSp]=useState({student:"",class_name:ALL_CLS[0],type:"Scholarship"});
  const[showPinChange,setShowPinChange]=useState(false);const[oldPin,setOldPin]=useState("");const[newPin,setNewPin]=useState("");const[newPin2,setNewPin2]=useState("");
  
  const sigARef=useRef();const sigBRef=useRef();const sigAdminRef=useRef();
  
  useEffect(()=>{setLocalTargets(ctx.feeTargets||{})},[ctx.feeTargets]);
  useEffect(()=>{setLocalProfile(ctx.schoolProfile||{})},[ctx.schoolProfile]);
  useEffect(()=>{setLocalAI(ctx.aiConfig||{})},[ctx.aiConfig]);
  
  function setTgt(grp,c,v){const group=FEE_GROUPS.find(g=>g.label===grp);const clsList=group?group.classes:[];setLocalTargets(prev=>{const n={...prev};clsList.forEach(k=>{n[k]={...(n[k]||{}),[c]:parseFloat(v)||0}});return n;});}
  
  async function saveAll(){
    setSaving(true);setMsg(null);
    ctx.setFeeTargets(localTargets);ctx.setSchoolProfile(localProfile);ctx.setAiConfig(localAI);
    const result=await ctx.saveAllSettings(ctx.categories,localTargets,ctx.termCfg,ctx.lessonCur,localProfile,localAI);
    setSaving(false);
    if(result?.ok){
      setMsg({t:0,m:"✓ Settings saved to database successfully."});
    } else {
      setMsg({t:1,m:"✗ DB save failed: "+(result?.error||"Unknown error")+". Settings saved locally only — will be lost on refresh. Check your Supabase connection."});
    }
    setTimeout(()=>setMsg(null),8e3);
  }
  
  function addCat(){if(!nc.trim()||(ctx.categories||[]).includes(nc.trim()))return;const u=[...(ctx.categories||[]),nc.trim()];ctx.setCategories(u);ctx.setTermCfg({...ctx.termCfg,activeCats:{...(ctx.termCfg?.activeCats||{}),[nc.trim()]:true}});setNc("");setMsg({t:0,m:`Category "${nc.trim()}" added. Click Save to persist.`});setTimeout(()=>setMsg(null),3e3)}
  function togCat(c){if(c==="Outstanding/Backlog"){setMsg({t:1,m:"Cannot disable Outstanding/Backlog."});setTimeout(()=>setMsg(null),2e3);return}ctx.setTermCfg({...ctx.termCfg,activeCats:{...(ctx.termCfg?.activeCats||{}),[c]:!(ctx.termCfg?.activeCats?.[c])}})}
  
  async function changePropPin(){const ok=await checkPropPin(oldPin);if(!ok){setMsg({t:1,m:"Old PIN incorrect."});return}if(newPin!==newPin2){setMsg({t:1,m:"PINs do not match."});return}if(!/^\d{4,8}$/.test(newPin)){setMsg({t:1,m:"PIN must be 4-8 digits."});return}const hash=await hashPin(newPin,PROP_USER);LS.s(PROP_PIN_KEY,hash);setOldPin("");setNewPin("");setNewPin2("");setShowPinChange(false);setMsg({t:0,m:"✓ PIN updated."});setTimeout(()=>setMsg(null),3e3)}
  
  async function addDP(){if(!dp.student.trim())return;await ctx.saveDP({did:uid(),...dp,amount:parseFloat(dp.amount)||0,date:today(),created_at:new Date().toISOString()});setDp({student:"",class_name:ALL_CLS[0],amount:""});setMsg({t:0,m:"Direct payment recorded."});setTimeout(()=>setMsg(null),2e3)}
  async function addSch(){if(!sp.student.trim())return;await ctx.saveSch({scid:uid(),...sp,date:today(),created_at:new Date().toISOString()});setSp({student:"",class_name:ALL_CLS[0],type:"Scholarship"});setMsg({t:0,m:"Scholarship recorded."});setTimeout(()=>setMsg(null),2e3)}
  
  function handleSig(s,file){if(!file)return;const reader=new FileReader();reader.onload=e=>{const b64=e.target.result;const sk=s==="A"?"bursarASignature":s==="B"?"bursarBSignature":"adminSignature";setLocalProfile(p=>({...p,[sk]:b64}))};reader.readAsDataURL(file)}
  
  return(
  <div className="fu">
    <div className="fb" style={{marginBottom:16}}>
      <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",color:"var(--navy)"}}>Settings</h2>
      <div style={{display:"flex",gap:8}}>
        <button className="btn btn-ghost btn-sm" onClick={async()=>{
          setMsg({t:2,m:"Testing DB…"});
          const SURL="https://qbjtiximcchhnxhttogq.supabase.co";
          const SKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianRpeGltY2NoaG54aHR0b2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1MDM5NCwiZXhwIjoyMDkxNDI2Mzk0fQ.485SXyI0Lvcr7eTtXA2Derlap8n2OTnqItZ0w15IJbM";
          const HDR={"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":"application/json","Prefer":"return=representation,resolution=merge-duplicates"};
          try{
            const wr=await fetch(`${SURL}/rest/v1/ssfp_settings`,{method:"POST",headers:HDR,body:JSON.stringify([{key:"__test__",value:{t:Date.now()}}])});
            const wStatus=wr.status;
            const wBody=await wr.text();
            if(!wr.ok){
              setMsg({t:1,m:`✗ WRITE FAILED — HTTP ${wStatus}: ${wBody}`});
              setTimeout(()=>setMsg(null),20e3);return;
            }
            const rr=await fetch(`${SURL}/rest/v1/ssfp_settings?key=eq.__test__&limit=1`,{headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY}});
            const rBody=await rr.text();
            const rData=JSON.parse(rBody);
            if(rData&&rData[0]){
              await fetch(`${SURL}/rest/v1/ssfp_settings?key=eq.__test__`,{method:"DELETE",headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY}});
              const result=await ctx.saveAllSettings(ctx.categories,ctx.feeTargets,ctx.termCfg,ctx.lessonCur,ctx.schoolProfile,ctx.aiConfig);
              if(result?.ok){setMsg({t:0,m:"✓ DB fully working! Write+Read+Settings all succeeded."});}
              else{setMsg({t:1,m:"✗ Test row worked but settings write failed: "+(result?.error||"unknown")});}
            } else {
              setMsg({t:1,m:`✗ Write HTTP ${wStatus} OK but read returned empty. Body: ${rBody}`});
            }
          }catch(e){setMsg({t:1,m:"✗ Exception: "+e.message});}
          setTimeout(()=>setMsg(null),20e3);
        }}>🔌 Test DB</button>
        <button className="btn btn-save" onClick={saveAll} disabled={saving}>{saving?"Saving…":"💾 SAVE ALL SETTINGS"}</button>
      </div>
    </div>
    {msg&&<div className={msg.t?"msg-err":"msg-ok"}>{msg.m}</div>}
    
    <div className="card"><div className="sect">School Profile & Receipt Details</div>
      <div className="gf2">
        <div className="fl"><span className="flb">School Name</span><input value={localProfile.name||""} onChange={e=>setLocalProfile({...localProfile,name:e.target.value})} className="inp" placeholder={SCHOOL_NAME}/></div>
        <div className="fl"><span className="flb">Address</span><input value={localProfile.address||""} onChange={e=>setLocalProfile({...localProfile,address:e.target.value})} className="inp" placeholder="School address"/></div>
        <div className="fl"><span className="flb">Phone</span><input value={localProfile.phone||""} onChange={e=>setLocalProfile({...localProfile,phone:e.target.value})} className="inp" placeholder="+234…"/></div>
        <div className="fl"><span className="flb">Email</span><input value={localProfile.email||""} onChange={e=>setLocalProfile({...localProfile,email:e.target.value})} className="inp" placeholder="school@email.com"/></div>
        <div className="fl"><span className="flb">School Motto</span><input value={localProfile.motto||""} onChange={e=>setLocalProfile({...localProfile,motto:e.target.value})} className="inp" placeholder="Optional motto"/></div>
      </div>
    </div>
    
    <div className="card"><div className="sect">✍️ Bursar Signatures (appear on receipts)</div>
      <p className="hint" style={{marginBottom:14}}>Upload a signature image from gallery for each section. Appears on official Tuition Fee receipts.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
        {["A","B","admin"].map(s=>{const sk=s==="A"?"bursarASignature":s==="B"?"bursarBSignature":"adminSignature";const sig=localProfile[sk];const refs={"A":sigARef,"B":sigBRef,"admin":sigAdminRef};const label=s==="admin"?"Administrator / Proprietor":("Section "+s+" — Bursar");return<div key={s} style={{padding:14,border:"1.5px dashed var(--border)",borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:".72rem",fontWeight:700,color:"var(--navy)",marginBottom:10}}>{label} Signature</div>
          {sig?<div><img src={sig} alt={`Sig ${s}`} style={{height:56,maxWidth:"100%",objectFit:"contain",display:"block",margin:"0 auto 10px",border:"1px solid var(--border)",borderRadius:4,padding:4,background:"#fff"}}/><div style={{display:"flex",gap:6,justifyContent:"center"}}><button className="btn btn-ghost btn-xs" onClick={()=>refs[s].current?.click()}>Replace</button><button className="btn btn-red btn-xs" onClick={()=>setLocalProfile(p=>({...p,[sk]:""}))}>Remove</button></div></div>
          :<div><div style={{fontSize:"2rem",marginBottom:8,opacity:.3}}>✍️</div><button className="btn btn-outline btn-sm" onClick={()=>refs[s].current?.click()}>📁 Upload from Gallery</button></div>}
          <input ref={refs[s]} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleSig(s,e.target.files[0])}/>
        </div>;})}
      </div>
      <p className="hint" style={{marginTop:10}}>PNG/JPG recommended. Use white background for best print quality. <strong>Admin/Proprietor</strong> signature appears on receipts for payments made directly to proprietor. Click "Save All Settings" to persist.</p>
    </div>
    
    <div className="card"><div className="sect">Term & Academic Year</div><div className="fr">
      <div className="fl"><span className="flb">Current Term</span><select value={ctx.termCfg?.term||"Term 1"} onChange={e=>ctx.setTermCfg({...ctx.termCfg,term:e.target.value})} className="sel" style={{width:140}}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></div>
      <div className="fl"><span className="flb">Academic Year</span><input value={ctx.termCfg?.year||""} onChange={e=>ctx.setTermCfg({...ctx.termCfg,year:e.target.value})} className="inp" style={{width:150}}/></div>
    </div></div>
    
    <div className="card"><div className="sect">Fee Categories & Per-Class Targets</div>
      <p className="hint" style={{marginBottom:12}}>Set the target amount payable per student for each class.</p>
      <div className="cp" style={{marginBottom:14}}>{FEE_GROUPS.map(g=><button key={g.label} className={"pill"+(selGrp===g.label?" a":"")} onClick={()=>setSelGrp(g.label)}>{g.label}</button>)}</div>
      <div style={{fontWeight:600,fontSize:".88rem",color:"var(--navy)",marginBottom:4}}>Targets for <strong>{selGrp}</strong></div>
      <div style={{fontSize:".75rem",color:"var(--muted)",marginBottom:10}}>Applies to: {(FEE_GROUPS.find(g=>g.label===selGrp)||{classes:[]}).classes.join(", ")}</div>
      {(ctx.categories||DEF_CATS).map(c=>{
        const grpClasses=(FEE_GROUPS.find(g=>g.label===selGrp)||{classes:[]}).classes;
        const firstCls=grpClasses[0]||"";
        const val=(localTargets[firstCls]||{})[c]||"";
        return<div key={c} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border2)",gap:10}}>
          <span style={{flex:1,fontSize:".88rem",fontWeight:500}}>{c}</span>
          <input type="number" value={val} onChange={e=>setTgt(selGrp,c,e.target.value)} className="inpm" placeholder="₦ Target" style={{width:130,padding:"5px 8px",fontSize:".82rem"}}/>
          <button onClick={()=>togCat(c)} className={ctx.termCfg?.activeCats?.[c]!==false?"ton":"tof"}>{ctx.termCfg?.activeCats?.[c]!==false?"ON":"OFF"}</button>
        </div>;
      })}
      <div className="fr" style={{marginTop:12}}>
        <input value={nc} onChange={e=>setNc(e.target.value)} className="inp" style={{flex:1}} placeholder="New category name" onKeyDown={e=>e.key==="Enter"&&addCat()}/>
        <button className="btn btn-outline btn-sm" onClick={addCat}>ADD CATEGORY</button>
      </div>
    </div>
    
    <div className="card"><div className="sect">✦ AI Configuration (OpenRouter)</div>
      <div className="gf2">
        <div className="fl"><span className="flb">OpenRouter API Key</span><input type="password" value={localAI.apiKey||""} onChange={e=>setLocalAI({...localAI,apiKey:e.target.value})} className="inp" placeholder="sk-or-…"/></div>
        <div className="fl"><span className="flb">AI Model</span><select value={localAI.model||""} onChange={e=>setLocalAI({...localAI,model:e.target.value})} className="sel"><option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (Free)</option><option value="google/gemini-pro">Gemini Pro</option><option value="anthropic/claude-3-haiku">Claude 3 Haiku</option><option value="openai/gpt-4o-mini">GPT-4o Mini</option><option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free)</option></select></div>
      </div>
      <p className="hint" style={{marginTop:6}}>Powers AI audit watchdog, anomaly detection, and OCR name extraction.</p>
    </div>
    
    {isProp&&<div className="card" style={{borderTop:"3px solid var(--gold)"}}><div className="sect">🔑 Change Proprietor PIN</div>
      {!showPinChange?<button className="btn btn-outline btn-sm" onClick={()=>setShowPinChange(true)}>Change My PIN</button>:
      <><div className="gf2">
        <div className="fl"><span className="flb">Current PIN</span><input type="password" inputMode="numeric" value={oldPin} onChange={e=>setOldPin(e.target.value.replace(/\D/g,""))} className="inp" placeholder="Current PIN" maxLength={8}/></div>
        <div className="fl"><span className="flb">New PIN</span><input type="password" inputMode="numeric" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,""))} className="inp" placeholder="New 4–8 digit PIN" maxLength={8}/></div>
        <div className="fl"><span className="flb">Confirm PIN</span><input type="password" inputMode="numeric" value={newPin2} onChange={e=>setNewPin2(e.target.value.replace(/\D/g,""))} className="inp" placeholder="Repeat" maxLength={8}/></div>
      </div><div className="fr" style={{marginTop:10}}><button className="btn btn-gold" onClick={changePropPin}>UPDATE PIN</button><button className="btn btn-ghost btn-sm" onClick={()=>setShowPinChange(false)}>Cancel</button></div></>}
    </div>}
    
    <div className="card"><div className="sect">💼 Direct Payments (to Proprietor)</div>
      <div className="fr">
        <div className="fl" style={{flex:2}}><span className="flb">Student</span><input value={dp.student} onChange={e=>setDp({...dp,student:e.target.value})} className="inp" placeholder="Student name"/></div>
        <div className="fl" style={{flex:1}}><span className="flb">Class</span><select value={dp.class_name} onChange={e=>setDp({...dp,class_name:e.target.value})} className="sel">{ALL_CLS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fl"><span className="flb">Amount (₦)</span><input type="number" value={dp.amount} onChange={e=>setDp({...dp,amount:e.target.value})} className="inpm" placeholder="0" style={{width:120}}/></div>
        <button className="btn btn-primary btn-sm" onClick={addDP}>RECORD</button>
      </div>
      {(ctx.directPay||[]).length>0&&<div className="tw" style={{marginTop:10}}><table><thead><tr><th>Student</th><th>Class</th><th className="r">Amount</th><th>Date</th></tr></thead><tbody>{(ctx.directPay||[]).map(d=><tr key={d.did}><td>{d.student}</td><td>{d.class_name}</td><td className="my">{N(d.amount)}</td><td>{fmtD(d.date)}</td></tr>)}</tbody></table></div>}
    </div>
    
    <div className="card"><div className="sect">🎓 Scholarship / Mercy of School</div>
      <div className="fr">
        <div className="fl" style={{flex:2}}><span className="flb">Student</span><input value={sp.student} onChange={e=>setSp({...sp,student:e.target.value})} className="inp" placeholder="Student name"/></div>
        <div className="fl" style={{flex:1}}><span className="flb">Class</span><select value={sp.class_name} onChange={e=>setSp({...sp,class_name:e.target.value})} className="sel">{ALL_CLS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fl"><span className="flb">Type</span><select value={sp.type} onChange={e=>setSp({...sp,type:e.target.value})} className="sel"><option>Scholarship</option><option>Mercy of School</option></select></div>
        <button className="btn btn-primary btn-sm" onClick={addSch}>RECORD</button>
      </div>
      {(ctx.scholarships||[]).length>0&&<div className="tw" style={{marginTop:10}}><table><thead><tr><th>Student</th><th>Class</th><th>Type</th><th>Date</th></tr></thead><tbody>{(ctx.scholarships||[]).map(s=><tr key={s.scid}><td>{s.student}</td><td>{s.class_name}</td><td><span className="badge bdo">{s.type}</span></td><td>{fmtD(s.date)}</td></tr>)}</tbody></table></div>}
    </div>
    <div className="card" style={{borderTop:"3px solid var(--red)", marginTop: "20px"}}><div className="sect">⚠️ Danger Zone</div>
      <p className="hint" style={{marginBottom:12}}>Clear all financial entries, audit logs, and salary records across all devices. This action is irreversible. Students registry will be preserved.</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button className="btn btn-red btn-sm" onClick={()=>{if(window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete all financial records across all devices and reset the app."))ctx.wipeData()}}>WIPE ALL FINANCIAL DATA</button>
        <button className="btn btn-outline btn-sm" style={{borderColor:"var(--red)",color:"var(--red)"}} onClick={()=>{if(window.confirm("Delete only Cash Book entries? All other settings and records will stay."))ctx.wipeEntries()}}>WIPE ONLY CASH BOOK ENTRIES</button>
      </div>
    </div>
  </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { sbG, sbP, sbPA, sbU, sbD } from '../utils/api';
import { DEF_CATS, SCHOOL_NAME, SUPER_USER, SUPER_PASS, PROP_USER } from '../constants';
import { today, mapKey, uid, N, LS, SS } from '../utils/helpers';

const Ctx = createContext();

export function Prov({ children }) {
  const[session,setSessionRaw]=useState(()=>SS.get("ssfp_sess",null));
  const setSession=useCallback((s)=>{setSessionRaw(s);if(s)SS.set("ssfp_sess",s);else{try{sessionStorage.removeItem("ssfp_sess")}catch{}}},[]);
  const[dbOk,setDbOk]=useState(null);const[syncMsg,setSyncMsg]=useState("");
  const[students,setStudents]=useState({});const[cashBook,setCashBook]=useState([]);
  const[categories,setCategories]=useState(()=>LS.get("ssfp_cats",DEF_CATS));
  const[feeTargets,setFeeTargets]=useState(()=>LS.get("ssfp_targets",{}));
  const[salaries,setSalaries]=useState([]);const[extExams,setExtExams]=useState([]);
  const[lessonWeeks,setLessonWeeks]=useState([]);
  const[lessonCur,setLessonCur]=useState(()=>LS.get("ssfp_lesson",{days:{},teacherRate:2500,teacherCount:10}));
  const[termCfg,setTermCfg]=useState(()=>LS.get("ssfp_term",{term:"Term 1",year:"2025/2026",activeCats:DEF_CATS.reduce((a,c)=>({...a,[c]:true}),{})}));
  const[directPay,setDirectPay]=useState([]);const[scholarships,setScholarships]=useState([]);
  const[auditLog,setAuditLog]=useState([]);const[notifs,setNotifs]=useState([]);
  const[schoolProfile,setSchoolProfile]=useState(()=>LS.get("ssfp_profile",{name:SCHOOL_NAME,address:"",phone:"",email:"",principal:"",motto:"",bursarASignature:"",bursarBSignature:"",adminSignature:""}));
  const[aiConfig,setAiConfig]=useState(()=>LS.get("ssfp_ai",{apiKey:"",model:"google/gemini-2.0-flash-001"}));

  useEffect(()=>{(async()=>{
    const tryG=async(t,q)=>{try{return await sbG(t,q)}catch(e){console.warn("Load failed:",t,e.message);return[]}};
    try{
      setSyncMsg("");
      let cb=[],cfg=null,sal=[],ext=[],lw=[],dp=[],sch=[],al=[],nf=[];
      [cb,sal,ext,lw,dp,sch,al,nf]=await Promise.all([
        tryG("ssfp_cashbook","order=timestamp.asc"),
        tryG("ssfp_salaries","order=created_at.desc"),
        tryG("ssfp_ext_exams","order=created_at.desc"),
        tryG("ssfp_lesson_weeks","order=created_at.desc"),
        tryG("ssfp_direct_pay","order=created_at.desc"),
        tryG("ssfp_scholarships","order=created_at.desc"),
        tryG("ssfp_audit_log","order=time.desc&limit=300"),
        tryG("ssfp_notifications","order=time.desc&limit=100")
      ]);
      setSyncMsg("");
      let raw=[];
      const mapped={};
      try{
        raw=await sbG("students","select=*&order=name.asc&limit=2000");
        if(raw.length>0){
          const sample=raw[0];
          const keys=Object.keys(sample);
          const nameCol=["name","student_name","fullname","full_name","student"].find(k=>keys.includes(k))||keys.find(k=>k.toLowerCase().includes("name"))||"name";
          const classCol=["class_key","class","class_name","className","student_class"].find(k=>keys.includes(k))||keys.find(k=>k.toLowerCase().includes("class"))||"class_key";
          const admCol=["admno","adm_no","admission_no","admission_number","reg_no","registration_number"].find(k=>keys.includes(k))||keys.find(k=>k.toLowerCase().includes("adm")||k.toLowerCase().includes("reg"))||"admno";
          const genderCol=["gender","sex"].find(k=>keys.includes(k))||"gender";
          raw.forEach(s=>{
            const cls=mapKey(s[classCol]);if(!cls)return;
            if(!mapped[cls])mapped[cls]=[];
            const adm=s[admCol]||("WTS-"+String(s.id||"").slice(0,6).toUpperCase());
            if(!mapped[cls].find(x=>x.admno===adm&&x.name===s[nameCol]))
              mapped[cls].push({name:s[nameCol]||"",admno:adm,gender:s[genderCol]||"",supaId:s.id,payments:[],arrears:0});
          });
        }
      }catch(se){
        const cached=LS.get("ssfp_students",{});Object.assign(mapped,cached);
      }
      try{const r=await sbG("ssfp_settings","key=eq.main&limit=1");if(r&&r[0])cfg=r[0].value}catch(se){}
      if(cfg){
        if(cfg.categories){setCategories(cfg.categories);LS.set("ssfp_cats",cfg.categories)}
        if(cfg.feeTargets){setFeeTargets(cfg.feeTargets);LS.set("ssfp_targets",cfg.feeTargets)}
        if(cfg.termCfg){setTermCfg(cfg.termCfg);LS.set("ssfp_term",cfg.termCfg)}
        if(cfg.lessonCur){setLessonCur(cfg.lessonCur);LS.set("ssfp_lesson",cfg.lessonCur)}
        if(cfg.schoolProfile){setSchoolProfile(p=>({...p,...cfg.schoolProfile}));LS.set("ssfp_profile",cfg.schoolProfile)}
        if(cfg.aiConfig){setAiConfig(a=>({...a,...cfg.aiConfig}));LS.set("ssfp_ai",cfg.aiConfig)}
      }
      cb.filter(e=>e.entry_type==="Income"&&!e.reversed).forEach(e=>{if(!mapped[e.class_name])return;const si=mapped[e.class_name].findIndex(s=>s.name===e.student);if(si>=0)mapped[e.class_name][si].payments.push({id:e.entry_id,date:e.date,category:e.category,amount:e.amount,mode:e.mode,isPriorTerm:e.is_prior_term||false,timestamp:e.timestamp,receiptId:e.receipt_id||e.entry_id})});
      cb.filter(e=>e.reversal_of).forEach(e=>{if(!mapped[e.class_name])return;const si=mapped[e.class_name].findIndex(s=>s.name===e.student);if(si>=0)mapped[e.class_name][si].payments.push({id:e.entry_id,date:e.date,category:e.category,amount:-Math.abs(e.amount),mode:e.mode,note:"Reversal",timestamp:e.timestamp})});
      setStudents(mapped);setCashBook(cb);
      setSalaries(sal);setExtExams(ext);setLessonWeeks(lw);setDirectPay(dp);setScholarships(sch);setAuditLog(al);setNotifs(nf);
      LS.set("ssfp_students",mapped);
      setDbOk(true);
    }catch(e){
      setDbOk(false);
    }
  })()},[]);

  const saveAllSettings=useCallback(async(cats,ft,tc,lc,sp,ai)=>{
    LS.set("ssfp_cats",cats);LS.set("ssfp_targets",ft);LS.set("ssfp_term",tc);LS.set("ssfp_lesson",lc);LS.set("ssfp_profile",sp);LS.set("ssfp_ai",ai);
    const val={categories:cats,feeTargets:ft,termCfg:tc,lessonCur:lc,schoolProfile:sp,aiConfig:ai};
    try{
      await sbU("ssfp_settings",[{key:"main",value:val}]);
      return{ok:true};
    }catch(e){
      return{ok:false,error:e.message};
    }
  },[]);

  const saveCashEntry=useCallback(async(e)=>{
    const row={entry_id:e.id,date:e.date,class_name:e.cls||null,student:e.student||null,category:e.category||null,amount:e.amount,mode:e.mode||"Cash",entry_type:e.type,timestamp:e.timestamp,section:e.section,is_prior_term:e.isPriorTerm||false,reversed:false,reversal_of:e.reversalOf||null,note:e.note||e.description||null,receipt_id:e.id};
    try{await sbU("ssfp_cashbook",[row])}catch(err){}
    setCashBook(p=>{const n=[...p,row];LS.set("ssfp_cashbook",n);return n});
  },[]);

  const markReversed=useCallback(async(id)=>{
    try{await sbPA("ssfp_cashbook",`entry_id=eq.${id}`,{reversed:true})}catch{}
    setCashBook(p=>{const n=p.map(e=>e.entry_id===id?{...e,reversed:true}:e);LS.set("ssfp_cashbook",n);return n});
  },[]);

  const addAudit=useCallback(async(action,details,who)=>{
    if(!who||who===PROP_USER||who===SUPER_USER)return;
    const entry={aid:uid(),action,details,time:Date.now(),user:who};
    try{await sbP("ssfp_audit_log",entry)}catch{}
    setAuditLog(p=>[entry,...p].slice(0,500));
  },[]);

  const addNotif=useCallback(async(msg,type="warning")=>{
    const n={nid:uid(),msg,type,time:Date.now(),read:false};
    try{await sbP("ssfp_notifications",n)}catch{}
    setNotifs(p=>[n,...p].slice(0,100));
  },[]);

  const runAIAudit=useCallback(async()=>{
    const ae=cashBook||[];
    const revs=ae.filter(e=>e.reversal_of).length;
    const largeT=ae.filter(e=>e.entry_type==="Income"&&!e.reversed&&e.amount>500000);
    const dupes=[];const seen={};ae.filter(e=>e.entry_type==="Income"&&!e.reversed).forEach(e=>{const k=e.student+e.date+e.category+e.amount;if(seen[k])dupes.push(e);seen[k]=true});
    if(dupes.length>0)addNotif(`Possible duplicates: ${dupes.length} entries.`,"error");
    if(revs>8)addNotif(`High reversals: ${revs} recorded.`,"warning");
    if(!aiConfig.apiKey)return;
    try{
      const ti=ae.filter(e=>e.entry_type==="Income"&&!e.reversed).reduce((s,e)=>s+e.amount,0);
      const te=ae.filter(e=>e.entry_type==="Expense"&&!e.reversal_of).reduce((s,e)=>s+e.amount,0);
      const resp=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+aiConfig.apiKey},body:JSON.stringify({model:aiConfig.model,messages:[{role:"user",content:`Analyze Nigerian school finance: Income ₦${ti.toLocaleString()}, Expenses ₦${te.toLocaleString()}, Reversals ${revs}. concise feedback.`}]})});
      const data=await resp.json();const text=data?.choices?.[0]?.message?.content||"";
      if(text)addNotif("AI: "+text,"warning");
    }catch(e){}
  },[cashBook,aiConfig,addNotif]);

  const refreshStudents=useCallback(async()=>{
    try{const raw=await sbG("students","select=id,name,class_key,admno,gender&order=name.asc");const mapped={};raw.forEach(s=>{const cls=mapKey(s.class_key);if(!cls)return;if(!mapped[cls])mapped[cls]=[];if(!mapped[cls].find(x=>x.admno===s.admno&&x.name===s.name))mapped[cls].push({name:s.name,admno:s.admno||"",gender:s.gender||"",supaId:s.id,payments:[],arrears:0})});setStudents(mapped)}
    catch(e){}
  },[]);

  const saveSal=async s=>{try{await sbP("ssfp_salaries",s)}catch{};setSalaries(p=>{const n=[...p,s];LS.set("ssfp_sal",n);return n})};
  const saveExt=async e=>{try{await sbP("ssfp_ext_exams",e)}catch{};setExtExams(p=>{const n=[...p,e];LS.set("ssfp_ext",n);return n})};
  const saveLW=async w=>{try{await sbP("ssfp_lesson_weeks",w)}catch{};setLessonWeeks(p=>{const n=[...p,w];LS.set("ssfp_lw",n);return n})};
  const saveDP=async d=>{try{await sbP("ssfp_direct_pay",d)}catch{};setDirectPay(p=>{const n=[...p,d];LS.set("ssfp_dp",n);return n})};
  const saveSch=async s=>{try{await sbP("ssfp_scholarships",s)}catch{};setScholarships(p=>{const n=[...p,s];LS.set("ssfp_sch",n);return n})};
  const deleteStudent=useCallback(async(cls,admno,supaId)=>{
    setStudents(p=>{const n={...p};if(n[cls])n[cls]=n[cls].filter(s=>s.admno!==admno);LS.set("ssfp_students",n);return n});
    if(supaId){try{await sbD("students",`id=eq.${supaId}`)}catch(e){}}
  },[]);

  const wipeData=useCallback(async()=>{
    localStorage.clear();sessionStorage.clear();
    const tables=["ssfp_cashbook","ssfp_salaries","ssfp_ext_exams","ssfp_lesson_weeks","ssfp_direct_pay","ssfp_scholarships","ssfp_audit_log","ssfp_notifications"];
    try{await Promise.all(tables.map(t=>sbD(t,"entry_id=neq.WIPE")));window.location.reload();}catch(e){}
  },[]);

  const wipeEntries=useCallback(async()=>{
    try{await sbD("ssfp_cashbook","entry_id=neq.WIPE");localStorage.removeItem("ssfp_cashbook");window.location.reload();}catch(e){}
  },[]);

  return <Ctx.Provider value={{
    session,setSession,dbOk,syncMsg,refreshStudents,
    students,setStudents,cashBook,setCashBook,
    categories,setCategories,feeTargets,setFeeTargets,
    salaries,extExams,lessonWeeks,lessonCur,setLessonCur,
    termCfg,setTermCfg,directPay,scholarships,
    auditLog,notifs,setNotifs,schoolProfile,setSchoolProfile,
    aiConfig,setAiConfig,saveCashEntry,markReversed,
    addAudit,addNotif,runAIAudit,saveAllSettings,
    saveSal,saveExt,saveLW,saveDP,saveSch,deleteStudent,wipeData,wipeEntries
  }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { sbG, sbP, sbPA, sbU, sbD } from '../utils/api';
import { DEF_CATS, SCHOOL_NAME, SUPER_USER, SUPER_PASS, PROP_USER } from '../constants';
import { today, mapKey, uid, N, LS, SS } from '../utils/helpers';

const Ctx = createContext();

export function Prov({ children }) {
  const[session,setSessionRaw]=useState(()=>SS.g("ssfp_sess",null));
  const setSession=useCallback((s)=>{setSessionRaw(s);if(s)SS.s("ssfp_sess",s);else{try{sessionStorage.removeItem("ssfp_sess")}catch{}}},[]);
  const[dbOk,setDbOk]=useState(null);const[syncMsg,setSyncMsg]=useState("Connecting…");
  const[students,setStudents]=useState({});const[cashBook,setCashBook]=useState([]);
  const[categories,setCategories]=useState(()=>LS.g("ssfp_cats",DEF_CATS));
  const[feeTargets,setFeeTargets]=useState(()=>LS.g("ssfp_targets",{}));
  const[salaries,setSalaries]=useState([]);const[extExams,setExtExams]=useState([]);
  const[lessonWeeks,setLessonWeeks]=useState([]);
  const[lessonCur,setLessonCur]=useState(()=>LS.g("ssfp_lesson",{days:{},teacherRate:2500,teacherCount:10}));
  const[termCfg,setTermCfg]=useState(()=>LS.g("ssfp_term",{term:"Term 1",year:"2025/2026",activeCats:DEF_CATS.reduce((a,c)=>({...a,[c]:true}),{})}));
  const[directPay,setDirectPay]=useState([]);const[scholarships,setScholarships]=useState([]);
  const[auditLog,setAuditLog]=useState([]);const[notifs,setNotifs]=useState([]);
  const[schoolProfile,setSchoolProfile]=useState(()=>LS.g("ssfp_profile",{name:SCHOOL_NAME,address:"",phone:"",email:"",principal:"",motto:"",bursarASignature:"",bursarBSignature:"",adminSignature:""}));
  const[aiConfig,setAiConfig]=useState(()=>LS.g("ssfp_ai",{apiKey:"",model:"google/gemini-2.0-flash-001"}));

  useEffect(()=>{(async()=>{
    const tryG=async(t,q)=>{try{return await sbG(t,q)}catch(e){console.warn("Load failed:",t,e.message);return[]}};
    try{
      setSyncMsg("Connecting to database…");
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
      setSyncMsg("Loading students…");
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
        const cached=LS.g("ssfp_students",{});Object.assign(mapped,cached);
      }
      try{const r=await sbG("ssfp_settings","key=eq.main&limit=1");if(r&&r[0])cfg=r[0].value}catch(se){}
      if(cfg){
        if(cfg.categories){setCategories(cfg.categories);LS.s("ssfp_cats",cfg.categories)}
        if(cfg.feeTargets){setFeeTargets(cfg.feeTargets);LS.s("ssfp_targets",cfg.feeTargets)}
        if(cfg.termCfg){setTermCfg(cfg.termCfg);LS.s("ssfp_term",cfg.termCfg)}
        if(cfg.lessonCur){setLessonCur(cfg.lessonCur);LS.s("ssfp_lesson",cfg.lessonCur)}
        if(cfg.schoolProfile){setSchoolProfile(p=>({...p,...cfg.schoolProfile}));LS.s("ssfp_profile",cfg.schoolProfile)}
        if(cfg.aiConfig){setAiConfig(a=>({...a,...cfg.aiConfig}));LS.s("ssfp_ai",cfg.aiConfig)}
      }
      cb.filter(e=>e.entry_type==="Income"&&!e.reversed).forEach(e=>{if(!mapped[e.class_name])return;const si=mapped[e.class_name].findIndex(s=>s.name===e.student);if(si>=0)mapped[e.class_name][si].payments.push({id:e.entry_id,date:e.date,category:e.category,amount:e.amount,mode:e.mode,isPriorTerm:e.is_prior_term||false,timestamp:e.timestamp,receiptId:e.receipt_id||e.entry_id})});
      cb.filter(e=>e.reversal_of).forEach(e=>{if(!mapped[e.class_name])return;const si=mapped[e.class_name].findIndex(s=>s.name===e.student);if(si>=0)mapped[e.class_name][si].payments.push({id:e.entry_id,date:e.date,category:e.category,amount:-Math.abs(e.amount),mode:e.mode,note:"Reversal",timestamp:e.timestamp})});
      setStudents(mapped);setCashBook(cb);
      setSalaries(sal);setExtExams(ext);setLessonWeeks(lw);setDirectPay(dp);setScholarships(sch);setAuditLog(al);setNotifs(nf);
      LS.s("ssfp_students",mapped);
      setDbOk(true);setSyncMsg(`Connected — ${raw.length} students, ${cb.length} entries`);
    }catch(e){
      console.error(e);setDbOk(false);setSyncMsg("Offline — local cache");
      setStudents(LS.g("ssfp_students",{}));setCashBook(LS.g("ssfp_cashbook",[]));
    }
  })()},[]);

  const[dbWriteErr,setDbWriteErr]=useState(null);
  const saveAllSettings=useCallback(async(cats,ft,tc,lc,sp,ai)=>{
    LS.s("ssfp_cats",cats);LS.s("ssfp_targets",ft);LS.s("ssfp_term",tc);LS.s("ssfp_lesson",lc);LS.s("ssfp_profile",sp);LS.s("ssfp_ai",ai);
    const val={categories:cats,feeTargets:ft,termCfg:tc,lessonCur:lc,schoolProfile:sp,aiConfig:ai};
    try{await sbU("ssfp_settings",[{key:"main",value:val}]);setDbWriteErr(null);return{ok:true}}
    catch(e){setDbWriteErr("⚠ Settings DB write failed");return{ok:false}}
  },[]);

  const saveCashEntry=useCallback(async(e)=>{
    const row={entry_id:e.id,date:e.date,class_name:e.cls||null,student:e.student||null,category:e.category||null,amount:e.amount,mode:e.mode||"Cash",entry_type:e.type,timestamp:e.timestamp,section:e.section,is_prior_term:e.isPriorTerm||false,reversed:false,reversal_of:e.reversalOf||null,note:e.note||e.description||null,receipt_id:e.id};
    try{await sbU("ssfp_cashbook",[row]);setDbWriteErr(null)}
    catch(err){setDbWriteErr("⚠ DB write failed")}
    setCashBook(p=>{const n=[...p,row];LS.s("ssfp_cashbook",n);return n});
  },[]);

  const markReversed=useCallback(async(id)=>{
    try{await sbPA("ssfp_cashbook",`entry_id=eq.${id}`,{reversed:true})}catch{}
    setCashBook(p=>{const n=p.map(e=>e.entry_id===id?{...e,reversed:true}:e);LS.s("ssfp_cashbook",n);return n});
  },[]);

  const addAudit=useCallback(async(action,details,who)=>{
    if(!who||who===PROP_USER||who===SUPER_USER||who==="proprietor")return;
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
    if(!aiConfig.apiKey)return;
    addNotif("AI Audit initiated...","warning");
  },[aiConfig,addNotif]);

  const refreshStudents=useCallback(async()=>{
    setSyncMsg("Syncing…");setDbOk(null);
    try{const raw=await sbG("students","select=id,name,class_key,admno,gender&order=name.asc");const mapped={};raw.forEach(s=>{const cls=mapKey(s.class_key);if(!cls)return;if(!mapped[cls])mapped[cls]=[];if(!mapped[cls].find(x=>x.admno===s.admno&&x.name===s.name))mapped[cls].push({name:s.name,admno:s.admno||"",gender:s.gender||"",supaId:s.id,payments:[],arrears:0})});setStudents(mapped);setDbOk(true);setSyncMsg(`Synced — ${raw.length} students`)}
    catch(e){setDbOk(false);setSyncMsg("Sync failed")}
  },[]);

  const saveSal=async s=>{try{await sbP("ssfp_salaries",s)}catch{};setSalaries(p=>[...p,s])};
  const saveExt=async e=>{try{await sbP("ssfp_ext_exams",e)}catch{};setExtExams(p=>[...p,e])};
  const saveLW=async w=>{try{await sbP("ssfp_lesson_weeks",w)}catch{};setLessonWeeks(p=>[...p,w])};
  const saveDP=async d=>{try{await sbP("ssfp_direct_pay",d)}catch{};setDirectPay(p=>[...p,d])};
  const saveSch=async s=>{try{await sbP("ssfp_scholarships",s)}catch{};setScholarships(p=>[...p,s])};
  const deleteStudent=useCallback(async(cls,admno,supaId)=>{
    setStudents(p=>{const n={...p};if(n[cls])n[cls]=n[cls].filter(s=>s.admno!==admno);return n});
    if(supaId){try{await sbD("students",`id=eq.${supaId}`)}catch(e){}}
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
    saveSal,saveExt,saveLW,saveDP,saveSch,deleteStudent,
    dbWriteErr,setDbWriteErr
  }}>
    {children}
  </Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);

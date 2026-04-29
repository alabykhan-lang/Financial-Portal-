import React, { useState, useEffect, useContext, createContext } from 'react';
import { sbG, sbU, sbPA } from '../utils/api';
import { LS, SS } from '../utils/helpers';
import { DEF_CATS } from '../constants';

const AppCtx = createContext();

export const Prov = ({ children }) => {
  const [session, setSession] = useState(SS.g('ssfp_session', null));
  const [students, setStudents] = useState(LS.g('ssfp_students', {}));
  const [cashBook, setCashBook] = useState(LS.g('ssfp_cashbook', []));
  const [categories, setCategories] = useState(LS.g('ssfp_categories', DEF_CATS));
  const [feeTargets, setFeeTargets] = useState(LS.g('ssfp_feetargets', {}));
  const [termCfg, setTermCfg] = useState(LS.g('ssfp_termcfg', { term: '1st Term', year: '2024/2025' }));
  const [auditLog, setAuditLog] = useState(LS.g('ssfp_audit', []));
  const [notifs, setNotifs] = useState(LS.g('ssfp_notifs', []));
  const [schoolProfile, setSchoolProfile] = useState(LS.g('ssfp_profile', {}));
  const [aiConfig, setAiConfig] = useState(LS.g('ssfp_aiconfig', { apiKey: '', model: 'google/gemini-2.0-flash-001' }));
  const [salaries, setSalaries] = useState(LS.g('ssfp_salaries', []));
  const [directPay, setDirectPay] = useState(LS.g('ssfp_direct', []));
  const [scholarships, setScholarships] = useState(LS.g('ssfp_scholar', []));
  const [lessonCur, setLessonCur] = useState(LS.g('ssfp_lesson_cur', { days: {}, teacherRate: 2500, teacherCount: 10 }));
  const [lessonWeeks, setLessonWeeks] = useState(LS.g('ssfp_lesson_weeks', []));
  const [extExams, setExtExams] = useState(LS.g('ssfp_ext', []));
  const [dbOk, setDbOk] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    SS.s('ssfp_session', session);
  }, [session]);

  useEffect(() => {
    LS.s('ssfp_students', students);
    LS.s('ssfp_cashbook', cashBook);
    LS.s('ssfp_categories', categories);
    LS.s('ssfp_feetargets', feeTargets);
    LS.s('ssfp_termcfg', termCfg);
    LS.s('ssfp_audit', auditLog);
    LS.s('ssfp_notifs', notifs);
    LS.s('ssfp_profile', schoolProfile);
    LS.s('ssfp_aiconfig', aiConfig);
    LS.s('ssfp_salaries', salaries);
    LS.s('ssfp_direct', directPay);
    LS.s('ssfp_scholar', scholarships);
    LS.s('ssfp_lesson_cur', lessonCur);
    LS.s('ssfp_lesson_weeks', lessonWeeks);
    LS.s('ssfp_ext', extExams);
  }, [students, cashBook, categories, feeTargets, termCfg, auditLog, notifs, schoolProfile, aiConfig, salaries, directPay, scholarships, lessonCur, lessonWeeks, extExams]);

  const initCloud = async () => {
    setDbOk(false);
    setSyncMsg('Connecting to cloud...');
    try {
      const [stu, cb, cats, ft, cfg, log, ntf, prof, ai, sal, dp, sch, lcur, lw, ext] = await Promise.all([
        sbG('students', 'order=name.asc'),
        sbG('ssfp_cashbook', 'order=timestamp.asc'),
        sbG('ssfp_categories', 'order=id.asc'),
        sbG('ssfp_feetargets'),
        sbG('ssfp_config'),
        sbG('ssfp_audit', 'order=time.desc'),
        sbG('ssfp_notifs', 'order=time.desc'),
        sbG('ssfp_profile'),
        sbG('ssfp_aiconfig'),
        sbG('ssfp_salaries', 'order=created_at.desc'),
        sbG('ssfp_direct', 'order=created_at.desc'),
        sbG('ssfp_scholar', 'order=created_at.desc'),
        sbG('ssfp_lesson_cur'),
        sbG('ssfp_lesson_weeks', 'order=date.desc'),
        sbG('ssfp_ext', 'order=date.desc')
      ]);

      const sm = {};
      stu.forEach(s => {
        const k = s.class_key;
        if (!sm[k]) sm[k] = [];
        const p = cb.filter(e => e.student === s.name && e.class_name === s.class_key && !e.reversed);
        sm[k].push({ ...s, payments: p, arrears: s.arrears || 0, supaId: s.id });
      });

      setStudents(sm);
      setCashBook(cb);
      if (cats.length) setCategories(cats.map(c => c.name));
      if (ft.length) {
        const fm = {};
        ft.forEach(x => { if (!fm[x.class_name]) fm[x.class_name] = {}; fm[x.class_name][x.category] = x.target; });
        setFeeTargets(fm);
      }
      if (cfg.length) setTermCfg(cfg[0]);
      setAuditLog(log);
      setNotifs(ntf);
      if (prof.length) setSchoolProfile(prof[0]);
      if (ai.length) setAiConfig(ai[0]);
      setSalaries(sal);
      setDirectPay(dp);
      setScholarships(sch);
      if (lcur.length) setLessonCur(lcur[0]);
      setLessonWeeks(lw);
      setExtExams(ext);

      setDbOk(true);
      setSyncMsg('Cloud Sync Active');
    } catch (e) {
      console.error(e);
      setDbOk(true);
      setSyncMsg('Offline Mode (Cloud Unavailable)');
    }
  };

  useEffect(() => {
    initCloud();
  }, []);

  const saveCashEntry = async (e) => {
    const ne = {
      entry_id: e.id,
      date: e.date,
      class_name: e.cls,
      student: e.student,
      category: e.category,
      amount: e.amount,
      mode: e.mode,
      entry_type: e.type,
      timestamp: e.timestamp,
      section: e.section,
      is_prior_term: e.isPriorTerm,
      note: e.description || ''
    };
    await sbU('ssfp_cashbook', [ne]);
    setCashBook(p => [...p, ne]);
  };

  const markReversed = async (id) => {
    await sbPA('ssfp_cashbook', `entry_id=eq.${id}`, { reversed: true });
    setCashBook(p => p.map(e => e.entry_id === id ? { ...e, reversed: true } : e));
  };

  const deleteStudent = async (cls, adm, sid) => {
    if (sid) await sbPA('students', `id=eq.${sid}`, { class_key: 'deleted' });
    setStudents(p => {
      const up = { ...p };
      up[cls] = up[cls].filter(s => s.admno !== adm);
      return up;
    });
  };

  const saveAllSettings = async (cats, ft, cfg, ai, prof, aic) => {
    setSyncMsg('Saving settings...');
    await Promise.all([
      sbU('ssfp_categories', cats.map((n, i) => ({ id: i + 1, name: n }))),
      sbU('ssfp_config', [{ id: 1, ...cfg }]),
      sbU('ssfp_profile', [{ id: 1, ...prof }]),
      sbU('ssfp_aiconfig', [{ id: 1, ...aic }])
    ]);
    const fta = [];
    Object.entries(ft).forEach(([c, o]) => {
      Object.entries(o).forEach(([cat, val]) => {
        fta.push({ class_name: c, category: cat, target: val });
      });
    });
    if (fta.length) await sbU('ssfp_feetargets', fta);
    setSyncMsg('Settings Saved');
  };

  const addAudit = async (action, details, user) => {
    const a = { aid: Date.now().toString(36), time: new Date().toISOString(), user, action, details };
    setAuditLog(p => [a, ...p]);
    await sbU('ssfp_audit', [a]);
  };

  const addNotif = async (msg, type = 'info') => {
    const n = { nid: Date.now().toString(36), time: new Date().toISOString(), msg, type, read: false };
    setNotifs(p => [n, ...p]);
    await sbU('ssfp_notifs', [n]);
  };

  const saveSal = async (s) => { await sbU('ssfp_salaries', [s]); setSalaries(p => [s, ...p]); };
  const saveDP = async (d) => { await sbU('ssfp_direct', [d]); setDirectPay(p => [d, ...p]); };
  const saveSch = async (s) => { await sbU('ssfp_scholar', [s]); setScholarships(p => [s, ...p]); };
  const saveLW = async (w) => { await sbU('ssfp_lesson_weeks', [w]); setLessonWeeks(p => [w, ...p]); };
  const saveExt = async (x) => { await sbU('ssfp_ext', [x]); setExtExams(p => [x, ...p]); };

  const wipeData = async () => {
    if (!window.confirm("CRITICAL: This will PERMANENTLY wipe all transaction data from the database. This action is IRREVERSIBLE. Are you 100% sure?")) return;
    setSyncMsg('Wiping Database...');
    try {
      const keys = {
        'ssfp_cashbook': 'entry_id',
        'ssfp_audit': 'aid',
        'ssfp_notifs': 'nid',
        'ssfp_salaries': 'sid',
        'ssfp_direct': 'did',
        'ssfp_scholar': 'scid',
        'ssfp_lesson_weeks': 'wid',
        'ssfp_ext': 'eid'
      };
      await Promise.all(Object.entries(keys).map(([table, pk]) => 
        fetch(`https://qbjtiximcchhnxhttogq.supabase.co/rest/v1/${table}?${pk}=neq.0`, {
          method: 'DELETE',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            'Content-Type': 'application/json'
          }
        })
      ));
      window.location.reload();
    } catch (e) {
      alert("Wipe failed: " + e.message);
    }
  };

  const wipeEntries = async () => {
    if (!window.confirm("Wipe all Cash Book entries? This will clear the daily transaction log but keep students, users, and settings.")) return;
    setSyncMsg('Clearing Cash Book...');
    try {
      await fetch(`https://qbjtiximcchhnxhttogq.supabase.co/rest/v1/ssfp_cashbook?entry_id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Content-Type': 'application/json'
        }
      });
      setCashBook([]);
      setSyncMsg('Cash Book Cleared');
      alert("✓ Cash Book entries wiped successfully.");
    } catch (e) {
      alert("Wipe failed: " + e.message);
    }
  };

  return (
    <AppCtx.Provider value={{
      session, setSession, students, setStudents, cashBook, setCashBook,
      categories, setCategories, feeTargets, setFeeTargets, termCfg, setTermCfg,
      auditLog, setAuditLog, notifs, setNotifs, schoolProfile, setSchoolProfile,
      aiConfig, setAiConfig, salaries, setSalaries, directPay, setDirectPay,
      scholarships, setScholarships, lessonCur, setLessonCur, lessonWeeks, setLessonWeeks,
      extExams, setExtExams, dbOk, syncMsg,
      saveCashEntry, markReversed, deleteStudent, saveAllSettings, addAudit, addNotif,
      saveSal, saveDP, saveSch, saveLW, saveExt, wipeData, wipeEntries
    }}>
      {children}
    </AppCtx.Provider>
  );
};

export const useApp = () => useContext(AppCtx);
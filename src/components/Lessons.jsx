import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SEC_A, SEC_B, ALL_CLS, DAYS } from '../constants';
import { N, today, uid, fmtD } from '../utils/helpers';

export default function Lessons({sec}){
  const ctx=useApp();
  const isAdmin=ctx.session?.role==="admin"||ctx.session?.role==="superadmin";
  const lc=ctx.lessonCur||{days:{},teacherRate:2500,teacherCount:10};
  const classes=sec==="A"?SEC_A:SEC_B;
  
  const setDC=(d,c,v)=>{const nd={...lc.days,[d]:{...(lc.days[d]||{}),[c]:parseFloat(v)||0}};ctx.setLessonCur({...lc,days:nd})};
  const gt=DAYS.reduce((s,d)=>s+classes.reduce((ss,c)=>ss+(lc.days[d]?.[c]||0),0),0);

  return(
  <div className="fu">
    <h2 style={{fontFamily:"var(--ff-d)",fontSize:"1.15rem",marginBottom:14}}>Lesson Portal</h2>
    <div className="card">
      <div className="sect">Weekly Collection — Section {sec}</div>
      <div style={{overflowX:"auto"}}><table className="tw"><thead><tr><th>Class</th>{DAYS.map(d=><th key={d}>{d.slice(0,3)}</th>)}</tr></thead><tbody>
        {classes.map(c=><tr key={c}><td>{c}</td>{DAYS.map(d=><td><input type="number" value={lc.days[d]?.[c]||""} onChange={e=>setDC(d,c,e.target.value)} className="li" style={{width:60}}/></td>)}</tr>)}
      </tbody></table></div>
      <div className="fb" style={{marginTop:12}}><strong>Total: {N(gt)}</strong></div>
    </div>
  </div>
  );
}

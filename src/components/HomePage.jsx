import React from 'react';
import { useApp } from '../context/AppContext';
import { today, N } from '../utils/helpers';

export default function HomePage({sec,setTab}){
  const ctx=useApp();
  const isAdmin=ctx.session?.role==="admin"||ctx.session?.role==="superadmin";
  
  return(
  <div className="fu">
    <div className="h-hero">
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
        <img src={window.LOGO_200} alt="School Logo" style={{width:80,height:80,objectFit:"contain"}}/>
        <div>
          <div style={{fontFamily:"var(--ff-d)",fontSize:"1.3rem",color:"var(--gold2)",fontWeight:700}}>Way to Success</div>
          <div style={{fontSize:".72rem",color:"rgba(255,255,255,.45)"}}>Finance Management Portal</div>
        </div>
      </div>
      <div style={{color:"rgba(255,255,255,.7)"}}>Welcome, <strong>{ctx.session?.name}</strong></div>
    </div>
    <div className="kg">
      <div className="kpi"><div className="kl">Today's Date</div><div className="kv">{today()}</div></div>
      <div className="kpi"><div className="kl">Section</div><div className="kv">Section {sec}</div></div>
    </div>
    <div className="card">
      <div className="sect">Quick Navigation</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {["cashbook","ledgers","analysis","lessons"].map(t=><button key={t} className="btn btn-outline btn-sm" onClick={()=>setTab(t)}>{t.toUpperCase()}</button>)}
      </div>
    </div>
  </div>
  );
}

import React from 'react';
import { SCHOOL_NAME } from '../../constants';
import { fmtD, today, N } from '../../utils/helpers';

export default function ReceiptDoc({viewRcp,sec,sp,bSig,adminSig,ctx}){
  const schoolName=sp.name||SCHOOL_NAME;
  const titleMap={tuition:"OFFICIAL TUITION FEE RECEIPT",single:"PAYMENT RECEIPT",category:"CATEGORY PAYMENT RECEIPT",all:"CONSOLIDATED PAYMENT STATEMENT"};
  const receiptTitle=titleMap[viewRcp.type]||"PAYMENT RECEIPT";
  const catLabel=viewRcp.category?viewRcp.category:null;
  
  return(
  <div className="rwrap" style={{maxWidth:560,margin:"0 auto",background:"#fff",padding:28,border:"2px solid #222"}}>
    {/* Header */}
    <div style={{textAlign:"center",borderBottom:"2.5px solid var(--navy)",paddingBottom:14,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:10}}>
        <img src={window.LOGO_80} alt="Logo" style={{width:64,height:64,objectFit:"contain",flexShrink:0}}/>
        <div style={{textAlign:"left"}}>
          <div className="rsch" style={{fontSize:"1.15rem",textAlign:"left"}}>{schoolName}</div>
          {sp.motto&&<div style={{fontStyle:"italic",fontSize:".68rem",color:"var(--slate)",marginTop:1}}>{sp.motto}</div>}
          <div style={{fontSize:".68rem",color:"var(--slate)",marginTop:2}}>{sp.address}{sp.phone?" · Tel: "+sp.phone:""}{sp.email?" · "+sp.email:""}</div>
        </div>
      </div>
      <div style={{display:"inline-block",background:"var(--navy)",color:"#fff",padding:"5px 20px",borderRadius:4,fontFamily:"var(--ff-m)",fontSize:".72rem",fontWeight:700,letterSpacing:1.2,marginTop:4}}>{receiptTitle}</div>
      {catLabel&&<div style={{marginTop:6,fontFamily:"var(--ff-m)",fontSize:".76rem",color:"var(--navy)",fontWeight:700}}>Category: {catLabel}</div>}
    </div>
    {/* Receipt meta */}
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:".75rem",flexWrap:"wrap",gap:6}}>
      <div><span style={{color:"var(--muted)"}}>Receipt No: </span><strong style={{fontFamily:"var(--ff-m)",color:"var(--navy)"}}>{viewRcp.receiptId}</strong></div>
      <div><span style={{color:"var(--muted)"}}>Date Issued: </span><strong>{viewRcp.issuedAt?new Date(viewRcp.issuedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}):fmtD(today())}</strong></div>
    </div>
    {/* Student info box */}
    <div style={{border:"1.5px solid var(--navy)",borderRadius:6,padding:"10px 14px",marginBottom:12,background:"var(--goldbg)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px",fontSize:".8rem"}}>
        {[["Student Name",viewRcp.student?.name],["Admission No",viewRcp.student?.admno||"—"],["Class",viewRcp.cls],["Term",`${ctx.termCfg?.term||""} — ${ctx.termCfg?.year||""}`]].map(([l,v])=><div key={l} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px dashed var(--border)"}}><span style={{color:"var(--muted)",width:100,flexShrink:0,fontSize:".7rem"}}>{l}</span><strong style={{fontFamily:"var(--ff-m)",fontSize:".78rem"}}>{v}</strong></div>)}
      </div>
    </div>
    {/* Payment table */}
    <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12,fontSize:".8rem"}}>
      <thead><tr style={{background:"var(--navy)",color:#fff"}}>
        <th style={{padding:"8px 10px",textAlign:"left",fontSize:".68rem",letterSpacing:.5}}>DATE</th>
        <th style={{padding:"8px 10px",textAlign:"left",fontSize:".68rem",letterSpacing:.5}}>CATEGORY</th>
        <th style={{padding:"8px 10px",textAlign:"left",fontSize:".68rem",letterSpacing:.5}}>MODE</th>
        <th style={{padding:"8px 10px",textAlign:"right",fontSize:".68rem",letterSpacing:.5}}>AMOUNT (₦)</th>
      </tr></thead>
      <tbody>{(viewRcp.payments||[]).map((p,i)=><tr key={i} style={{borderBottom:"1px solid var(--border2)",background:i%2===0?"#fff":"var(--bg2)"}}>
        <td style={{padding:"7px 10px"}}>{fmtD(p.date)}</td>
        <td style={{padding:"7px 10px",fontWeight:500}}>{p.category}</td>
        <td style={{padding:"7px 10px"}}><span style={{fontFamily:"var(--ff-m)",fontSize:".68rem",background:"var(--bg2)",padding:"2px 8px",borderRadius:3,border:"1px solid var(--border)"}}>{p.mode||"Cash"}</span></td>
        <td style={{padding:"7px 10px",textAlign:"right",fontFamily:"var(--ff-m)",fontWeight:700,color:"var(--green)"}}>{N(p.amount)}</td>
      </tr>)}</tbody>
    </table>
    {/* Total */}
    <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2.5px solid var(--ink)",marginBottom:16}}>
      <span style={{fontWeight:800,fontSize:".9rem"}}>{viewRcp.type==="tuition"?"TOTAL TUITION PAID":viewRcp.type==="all"?"TOTAL AMOUNT PAID":"AMOUNT PAID"}</span>
      <span style={{fontFamily:"var(--ff-m)",fontWeight:800,fontSize:"1.05rem",color:"var(--green)"}}>{N(viewRcp.total)}</span>
    </div>
    {/* Signatures */}
    <div style={{display:"grid",gridTemplateColumns:viewRcp.isPropPay?"1fr 1fr":"1fr",gap:20,marginTop:20,paddingTop:14,borderTop:"1px dashed var(--border)"}}>
      <div style={{textAlign:"center"}}>
        {bSig?<img src={bSig} alt="Bursar Sig" style={{height:52,maxWidth:160,objectFit:"contain",display:"block",margin:"0 auto 8px",borderBottom:"1px solid #888",paddingBottom:4}}/>:<div style={{height:44,borderBottom:"1.5px solid #888",width:160,margin:"0 auto 8px"}}/>}
        <div style={{fontSize:".65rem",fontWeight:700,color:"var(--navy)"}}>BURSAR — SECTION {sec}</div>
        <div style={{fontSize:".6rem",color:"var(--muted)",marginTop:1}}>(Official Stamp)</div>
      </div>
      {viewRcp.isPropPay&&<div style={{textAlign:"center"}}>
        {adminSig?<img src={adminSig} alt="Admin Sig" style={{height:52,maxWidth:160,objectFit:"contain",display:"block",margin:"0 auto 8px",borderBottom:"1px solid #888",paddingBottom:4}}/>:<div style={{height:44,borderBottom:"1.5px solid #888",width:160,margin:"0 auto 8px"}}/>}
        <div style={{fontSize:".65rem",fontWeight:700,color:"var(--navy)"}}>ADMINISTRATOR / PROPRIETOR</div>
        <div style={{fontSize:".6rem",color:"var(--muted)",marginTop:1}}>(Counter-Signature)</div>
      </div>}
    </div>
    {/* Footer */}
    <div style={{marginTop:14,padding:"8px 12px",background:"var(--bg2)",borderRadius:5,fontSize:".64rem",color:"var(--muted)",textAlign:"center",lineHeight:1.8}}>
      <div>This is an <strong>official payment receipt</strong> of <strong>{schoolName}</strong>. Please retain for your records.</div>
      <div>Issued by: <strong>{viewRcp.issuedBy||"Bursar"}</strong> · {viewRcp.issuedAt?new Date(viewRcp.issuedAt).toLocaleString():""}</div>
      {sp.principal&&<div>Principal: <strong>{sp.principal}</strong></div>}
    </div>
  </div>
  );
}

import React from 'react';
import { SCHOOL_NAME } from '../constants';
import { fmtD, N } from '../utils/helpers';

export default function ReceiptDoc({viewRcp,sec,sp,bSig,ctx}){
  return(
  <div className="rwrap" style={{background:"#fff",padding:20,border:"1px solid #000",maxWidth:400,margin:"auto"}}>
    <div style={{textAlign:"center",marginBottom:10}}><strong>{sp.name||SCHOOL_NAME}</strong><br/>{viewRcp.type.toUpperCase()} RECEIPT</div>
    <div style={{fontSize:".8rem",marginBottom:10}}>Student: {viewRcp.student?.name}<br/>Class: {viewRcp.cls}</div>
    <table style={{width:"100%",fontSize:".8rem",marginBottom:10}}><thead><tr><th>Date</th><th>Category</th><th className="r">Amount</th></tr></thead><tbody>{viewRcp.payments.map((p,i)=><tr key={i}><td>{fmtD(p.date)}</td><td>{p.category}</td><td className="r">{N(p.amount)}</td></tr>)}</tbody></table>
    <div style={{textAlign:"right",fontWeight:700}}>Total: {N(viewRcp.total)}</div>
  </div>
  );
}

import React from 'react';
import { SCHOOL_SHORT } from '../constants';

export default function Splash() {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"var(--navy)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:36,height:36,border:"3px solid rgba(201,168,76,.3)",borderTopColor:"var(--gold)",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        <p style={{color:"rgba(255,255,255,.5)",marginTop:16,fontSize:".8rem"}}>{SCHOOL_SHORT}</p>
      </div>
    </div>
  );
}

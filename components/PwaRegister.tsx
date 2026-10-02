"use client";
import { useEffect } from "react";

export default function PwaRegister(){
  useEffect(()=>{
    if(typeof window!=="undefined" && "serviceWorker" in navigator){
      // Register only if sw.js exists, ignore errors
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
  },[]);
  return null;
}

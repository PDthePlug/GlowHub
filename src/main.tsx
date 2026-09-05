import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DiscoverHome from './DiscoverHome';
import './index.css';

function isDiscoverHome(hash:string){
  const raw=hash.trim().replace(/^#/,'');
  const path=raw.split('?')[0].replace(/^\/+|\/+$/g,'');
  return path==='';
}
function Root(){
  const[hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
  return isDiscoverHome(hash)?<DiscoverHome/>:<App/>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root/></StrictMode>);

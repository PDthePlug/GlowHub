import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DiscoverHome from './DiscoverHome';
import BusinessAuth from './BusinessAuth';
import './index.css';

function routePath(hash:string){const raw=hash.trim().replace(/^#/,'');return raw.split('?')[0].replace(/^\/+|\/+$/g,'')}
function isDiscoverHome(hash:string){return routePath(hash)===''}
function isBusinessAuth(hash:string){return routePath(hash)==='app'}
function Root(){
  const[hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
  if(isDiscoverHome(hash))return <DiscoverHome/>;
  if(isBusinessAuth(hash))return <BusinessAuth/>;
  return <App/>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root/></StrictMode>);

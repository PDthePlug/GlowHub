import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DiscoverHome from './DiscoverHome';
import BusinessAuth from './BusinessAuth';
import ServiceGalleryPage from './ServiceGalleryPage';
import './index.css';

function routePath(hash:string){const raw=hash.trim().replace(/^#/,'');return raw.split('?')[0].replace(/^\/+|\/+$/g,'')}
function routeParts(hash:string){return routePath(hash).split('/').filter(Boolean)}
function isDiscoverHome(hash:string){return routePath(hash)===''}
function isBusinessAuth(hash:string){return routePath(hash)==='app'}
function serviceRoute(hash:string){const parts=routeParts(hash);return parts.length===3&&parts[1]==='service'?{slug:parts[0],serviceId:parts[2]}:null}
function Root(){
  const[hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
  const service=serviceRoute(hash);
  if(isDiscoverHome(hash))return <DiscoverHome/>;
  if(isBusinessAuth(hash))return <BusinessAuth/>;
  if(service)return <ServiceGalleryPage slug={service.slug} serviceId={service.serviceId}/>;
  return <App/>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root/></StrictMode>);

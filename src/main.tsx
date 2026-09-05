import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DiscoverHome from './DiscoverHome';
import BusinessAuth from './BusinessAuth';
import ServiceGalleryPage from './ServiceGalleryPage';
import PublicProfile from './PublicProfile';
import PublicBooking from './PublicBooking';
import './index.css';

function routePath(hash:string){const raw=hash.trim().replace(/^#/,'');return raw.split('?')[0].replace(/^\/+|\/+$/g,'')}
function routeParts(hash:string){return routePath(hash).split('/').filter(Boolean)}
function isDiscoverHome(hash:string){return routePath(hash)===''}
function isBusinessAuth(hash:string){return routePath(hash)==='app'}
function serviceRoute(hash:string){const parts=routeParts(hash);return parts.length===3&&parts[1]==='service'?{slug:parts[0],serviceId:parts[2]}:null}
const RESERVED=new Set(['app','join','privacy','terms','platform']);
function bookingRoute(hash:string){const parts=routeParts(hash);return parts.length===2&&parts[1]==='book'&&!RESERVED.has(parts[0])?{slug:parts[0]}:null}
function publicProfileRoute(hash:string){const parts=routeParts(hash);if(!parts[0]||RESERVED.has(parts[0]))return null;const page=(parts[1]||'home') as 'home'|'services'|'portfolio'|'reviews'|'about';if(parts.length>2||!['home','services','portfolio','reviews','about'].includes(page))return null;return{slug:parts[0],page}}
function Root(){
  const[hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
  const service=serviceRoute(hash),booking=bookingRoute(hash),profile=publicProfileRoute(hash);
  if(isDiscoverHome(hash))return <DiscoverHome/>;
  if(isBusinessAuth(hash))return <BusinessAuth/>;
  if(service)return <ServiceGalleryPage slug={service.slug} serviceId={service.serviceId}/>;
  if(booking)return <PublicBooking slug={booking.slug}/>;
  if(profile)return <PublicProfile slug={profile.slug} page={profile.page}/>;
  return <App/>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root/></StrictMode>);

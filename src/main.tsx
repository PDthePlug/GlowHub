import { StrictMode,Suspense,lazy,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App=lazy(()=>import('./App'));
const DiscoverHome=lazy(()=>import('./DiscoverHome'));
const BusinessAuth=lazy(()=>import('./BusinessAuth'));
const ServiceGalleryPage=lazy(()=>import('./ServiceGalleryPage'));
const PublicProfile=lazy(()=>import('./PublicProfile'));
const PublicBooking=lazy(()=>import('./PublicBooking'));
const PublicWaitlist=lazy(()=>import('./PublicWaitlist'));

function routePath(hash:string){const raw=hash.trim().replace(/^#/,'');return raw.split('?')[0].replace(/^\/+|\/+$/g,'')}
function routeParts(hash:string){return routePath(hash).split('/').filter(Boolean)}
function isDiscoverHome(hash:string){return routePath(hash)===''}
function isBusinessAuth(hash:string){return routePath(hash)==='app'}
function serviceRoute(hash:string){const parts=routeParts(hash);return parts.length===3&&parts[1]==='service'?{slug:parts[0],serviceId:parts[2]}:null}
const RESERVED=new Set(['app','join','privacy','terms','platform']);
function bookingRoute(hash:string){const parts=routeParts(hash);return parts.length===2&&parts[1]==='book'&&!RESERVED.has(parts[0])?{slug:parts[0]}:null}
function waitlistRoute(hash:string){const parts=routeParts(hash);return parts.length===2&&parts[1]==='waitlist'&&!RESERVED.has(parts[0])?{slug:parts[0]}:null}
function publicProfileRoute(hash:string){const parts=routeParts(hash);if(!parts[0]||RESERVED.has(parts[0]))return null;const page=(parts[1]||'home') as 'home'|'services'|'portfolio'|'reviews'|'about';if(parts.length>2||!['home','services','portfolio','reviews','about'].includes(page))return null;return{slug:parts[0],page}}
function RouteLoader(){return <div className='min-h-screen grid place-items-center bg-[#f7f4ef] text-sm text-stone-500'>Opening…</div>}
function Root(){
  const[hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
  const service=serviceRoute(hash),booking=bookingRoute(hash),waitlist=waitlistRoute(hash),profile=publicProfileRoute(hash);
  let content;
  if(isDiscoverHome(hash))content=<DiscoverHome/>;
  else if(isBusinessAuth(hash))content=<BusinessAuth/>;
  else if(service)content=<ServiceGalleryPage slug={service.slug} serviceId={service.serviceId}/>;
  else if(booking)content=<PublicBooking slug={booking.slug}/>;
  else if(waitlist)content=<PublicWaitlist slug={waitlist.slug}/>;
  else if(profile)content=<PublicProfile slug={profile.slug} page={profile.page}/>;
  else content=<App/>;
  return <Suspense fallback={<RouteLoader/>}>{content}</Suspense>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root/></StrictMode>);

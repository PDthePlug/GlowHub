// Production entrypoint for the Glow Hub Supabase Edge API.
import { routeResponseToResponse } from '@appdeploy/sdk';
import { handler, communicationAutomationHandler } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/26aa42b12dd93dd1e01bfe5a57862515e7c099e0/backend/index.ts';
import { discoveryRoutes } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/26aa42b12dd93dd1e01bfe5a57862515e7c099e0/backend/discovery.ts';
import { serviceManagementHandler } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/26aa42b12dd93dd1e01bfe5a57862515e7c099e0/backend/service-management.ts';
import { heroGalleryHandler } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/26aa42b12dd93dd1e01bfe5a57862515e7c099e0/backend/hero-gallery.ts';

const cors={
  'access-control-allow-origin':'*',
  'access-control-allow-headers':'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS',
};
let lastMaintenance=0;
function pathOf(req:Request){const p=new URL(req.url).pathname;const i=p.indexOf('/api/');return i>=0?p.slice(i):p.replace(/^\/functions\/v1\/[^/]+/,'')||'/'}
function withCors(response:Response){
  const headers=new Headers(response.headers);
  for(const[key,value]of Object.entries(cors))headers.set(key,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  const path=pathOf(req);
  if(path.startsWith('/api/hero-gallery')){
    return withCors(await (heroGalleryHandler as any)(req));
  }
  if(req.method==='GET'&&path==='/api/discover'){
    const query:Record<string,string>={};new URL(req.url).searchParams.forEach((v,k)=>query[k]=v);
    const result=await (discoveryRoutes['GET /api/discover'][0] as any)({query});
    return withCors(routeResponseToResponse(result));
  }
  if((req.method==='PUT'||req.method==='DELETE')&&/^\/api\/services\/[^/]+$/.test(path)){
    return withCors(await (serviceManagementHandler as any)(req));
  }
  if(Date.now()-lastMaintenance>60000&&(path.startsWith('/api/workspace/')||path.startsWith('/api/booking/')||path.startsWith('/api/growth/'))){
    lastMaintenance=Date.now();
    try{await communicationAutomationHandler({type:'scheduled',name:'traffic-sweep',payload:{},scheduledTime:new Date().toISOString()})}catch(err){console.warn('maintenance sweep skipped',err)}
  }
  return withCors(await (handler as any)(req));
});

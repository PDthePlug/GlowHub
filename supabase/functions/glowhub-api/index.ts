import { routeResponseToResponse } from '@appdeploy/sdk';
import { handler, communicationAutomationHandler } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/388d8628e2aef2385561c5abe9acb3a5542c4dd5/backend/index.ts';
import { discoveryRoutes } from 'https://raw.githubusercontent.com/PDthePlug/GlowHub/388d8628e2aef2385561c5abe9acb3a5542c4dd5/backend/discovery.ts';

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
  if(req.method==='GET'&&path==='/api/discover'){
    const query:Record<string,string>={};new URL(req.url).searchParams.forEach((v,k)=>query[k]=v);
    const result=await (discoveryRoutes['GET /api/discover'][0] as any)({query});
    return withCors(routeResponseToResponse(result));
  }
  if(Date.now()-lastMaintenance>60000&&(path.startsWith('/api/workspace/')||path.startsWith('/api/booking/')||path.startsWith('/api/growth/'))){
    lastMaintenance=Date.now();
    try{await communicationAutomationHandler({type:'scheduled',name:'traffic-sweep',payload:{},scheduledTime:new Date().toISOString()})}catch(err){console.warn('maintenance sweep skipped',err)}
  }
  return withCors(await (handler as any)(req));
});

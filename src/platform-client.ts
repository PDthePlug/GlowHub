import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL='https://lnxhtdaocawrqlldhxcz.supabase.co';
const SUPABASE_KEY='sb_publishable_Mv-3DPERIRKdQjOePp5JFQ_M5bbMW4x';
const PROJECT_REF='lnxhtdaocawrqlldhxcz';
const PRODUCTION_APP_URL='https://glowhub-three.vercel.app';
const API_BASE=`${SUPABASE_URL}/functions/v1/glowhub-api`;

function callbackParams(){
  const raw=window.location.hash.replace(/^#/,'');
  if(raw.includes('?'))return new URLSearchParams(raw.slice(raw.indexOf('?')+1));
  return new URLSearchParams(raw.replace(/^\/?/,''));
}
const incomingUrl=new URL(window.location.href);
const incomingCallback=callbackParams();
const callbackAccessToken=incomingCallback.get('access_token')||'';
const callbackRefreshToken=incomingCallback.get('refresh_token')||'';
const callbackCode=incomingUrl.searchParams.get('code')||'';
const hasImplicitCallback=Boolean(callbackAccessToken&&callbackRefreshToken);
const hasPkceCallback=Boolean(callbackCode);
let callbackSessionPending=hasImplicitCallback||hasPkceCallback;

if(callbackSessionPending||incomingUrl.searchParams.get('auth')==='confirmation'){
  incomingUrl.searchParams.delete('code');
  incomingUrl.searchParams.delete('auth');
  incomingUrl.hash='/app';
  history.replaceState({},'',incomingUrl.toString());
}

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let authBootstrap:Promise<void>=Promise.resolve();
if(hasImplicitCallback){
  authBootstrap=supabase.auth.setSession({access_token:callbackAccessToken,refresh_token:callbackRefreshToken}).then(({error})=>{if(error)throw error}).finally(()=>{callbackSessionPending=false});
}else if(hasPkceCallback){
  authBootstrap=supabase.auth.exchangeCodeForSession(callbackCode).then(({error})=>{if(error)throw error}).finally(()=>{callbackSessionPending=false});
}

type Method='GET'|'POST'|'PUT'|'DELETE';
type ApiError=Error&{response?:{status:number;data:any};code?:string};
async function request(method:Method,path:string,body?:unknown){
  await authBootstrap;
  const {data:{session}}=await supabase.auth.getSession();
  const headers:Record<string,string>={'content-type':'application/json',apikey:SUPABASE_KEY};
  if(session?.access_token)headers.authorization=`Bearer ${session.access_token}`;
  const res=await fetch(`${API_BASE}${path}`,{method,headers,...(method!=='GET'&&body!==undefined?{body:JSON.stringify(body)}:{})});
  const text=await res.text();let data:any={};try{data=text?JSON.parse(text):{}}catch{data={message:text}}
  if(!res.ok){const err=new Error(data?.error||data?.message||`Request failed (${res.status})`) as ApiError;err.response={status:res.status,data};throw err}
  window.dispatchEvent(new CustomEvent('glowhub:refresh',{detail:{path,method}}));
  return{data};
}
export const api={get:(path:string)=>request('GET',path),post:(path:string,body?:unknown)=>request('POST',path,body),put:(path:string,body?:unknown)=>request('PUT',path,body),delete:(path:string,body?:unknown)=>request('DELETE',path,body)};

function authKey(){return`sb-${PROJECT_REF}-auth-token`}
function signedInNow(){if(callbackSessionPending)return true;try{return Boolean(localStorage.getItem(authKey()))}catch{return false}}
function authRedirectUrl(){return `${PRODUCTION_APP_URL}/?auth=confirmation`}
function authModal(){return new Promise<void>((resolve,reject)=>{
  const existing=document.getElementById('glowhub-auth-modal');if(existing)existing.remove();
  const wrap=document.createElement('div');wrap.id='glowhub-auth-modal';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');
  wrap.innerHTML=`<div class="gh-auth-backdrop"><div class="gh-auth-card"><button class="gh-auth-close" aria-label="Close">×</button><div class="gh-auth-mark">G</div><p class="gh-auth-kicker">Glow Hub business account</p><h2>Sign in to your business.</h2><p class="gh-auth-copy">Use your email and password. New here? Create your account from the same screen.</p><label>Email<input class="gh-auth-email" type="email" autocomplete="email" placeholder="you@example.com"></label><label>Password<input class="gh-auth-password" type="password" autocomplete="current-password" minlength="6" placeholder="At least 6 characters"></label><p class="gh-auth-message" aria-live="polite"></p><div class="gh-auth-actions"><button class="gh-auth-signin">Sign in</button><button class="gh-auth-signup">Create account</button></div></div></div><style>#glowhub-auth-modal{position:fixed;inset:0;z-index:9999;font-family:Inter,ui-sans-serif,system-ui}.gh-auth-backdrop{position:absolute;inset:0;display:grid;place-items:center;padding:20px;background:rgba(28,25,23,.46);backdrop-filter:blur(10px)}.gh-auth-card{position:relative;width:min(100%,460px);border:1px solid rgba(28,25,23,.12);border-radius:30px;background:#fbf8f2;padding:30px;box-shadow:0 28px 90px rgba(28,25,23,.24);color:#1c1917}.gh-auth-close{position:absolute;right:18px;top:16px;width:36px;height:36px;border:0;border-radius:999px;background:#fff;font-size:24px;cursor:pointer}.gh-auth-mark{display:grid;width:42px;height:42px;place-items:center;border-radius:13px;background:#171417;color:#fff;font-weight:900}.gh-auth-kicker{margin:18px 0 0;font-size:11px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#8b6279}.gh-auth-card h2{margin:8px 0 0;font-family:Georgia,serif;font-size:38px;line-height:1}.gh-auth-copy{margin:12px 0 22px;color:#6b6468;font-size:14px;line-height:1.6}.gh-auth-card label{display:block;margin-top:13px;font-size:12px;font-weight:800;color:#6b6468}.gh-auth-card input{width:100%;margin-top:7px;border:1px solid #ded8d3;border-radius:14px;background:#fff;padding:13px 14px;outline:none;color:#171417}.gh-auth-card input:focus{border-color:#8f7b85;box-shadow:0 0 0 3px rgba(143,123,133,.12)}.gh-auth-message{min-height:20px;margin:12px 0 0;font-size:12px;line-height:1.5;color:#9f3d45}.gh-auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.gh-auth-actions button{border-radius:999px;padding:13px;border:1px solid #171417;font-weight:850;cursor:pointer}.gh-auth-signin{background:#171417;color:#fff}.gh-auth-signup{background:#fff;color:#171417}@media(max-width:520px){.gh-auth-card{padding:25px 20px}.gh-auth-card h2{font-size:33px}.gh-auth-actions{grid-template-columns:1fr}}</style>`;
  document.body.appendChild(wrap);
  const email=wrap.querySelector('.gh-auth-email') as HTMLInputElement,password=wrap.querySelector('.gh-auth-password') as HTMLInputElement,message=wrap.querySelector('.gh-auth-message') as HTMLParagraphElement,signIn=wrap.querySelector('.gh-auth-signin') as HTMLButtonElement,signUp=wrap.querySelector('.gh-auth-signup') as HTMLButtonElement,close=wrap.querySelector('.gh-auth-close') as HTMLButtonElement;
  const finish=()=>{wrap.remove();resolve()};const fail=(err:unknown)=>{const e=err as{message?:string};message.style.color='#9f3d45';message.textContent=e.message||'Sign in could not be completed.';signIn.disabled=false;signUp.disabled=false};
  close.onclick=()=>{wrap.remove();const e=new Error('Sign in closed') as ApiError;e.code='popup_closed';reject(e)};
  signIn.onclick=async()=>{if(!email.value||!password.value){message.textContent='Enter your email and password.';return}signIn.disabled=true;signUp.disabled=true;message.textContent='Signing in…';const{error}=await supabase.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(error){fail(error);return}finish()};
  signUp.onclick=async()=>{if(!email.value||password.value.length<6){message.textContent='Enter a valid email and a password with at least 6 characters.';return}signIn.disabled=true;signUp.disabled=true;message.textContent='Creating your account…';const{data,error}=await supabase.auth.signUp({email:email.value.trim(),password:password.value,options:{emailRedirectTo:authRedirectUrl()}});if(error){fail(error);return}if(data.session){finish();return}message.style.color='#446b57';message.textContent='Account created. Check your email to confirm it. The confirmation will return you directly to business setup.';signIn.disabled=false;signUp.disabled=false};
  setTimeout(()=>email.focus(),20);
})}
export const auth={isSignedIn:()=>signedInNow(),signIn:()=>authModal(),async signOut(){await authBootstrap;await supabase.auth.signOut()},client:supabase};

export const invitesClient={getPendingCode(){return new URLSearchParams(window.location.search).get('invite')||''},clearPendingCode(){const url=new URL(window.location.href);url.searchParams.delete('invite');history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`)},buildJoinUrl(code:string,opts?:{path?:string}){const path=opts?.path||'#/join';return`${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}${path}`}};

export const notifications={async subscribe(){if(!('Notification'in window))throw new Error('Notifications are not supported on this device.');const result=await Notification.requestPermission();if(result!=='granted')throw new Error('Notifications were not enabled.');return{ok:true}},onMessage(callback:()=>void){const fn=()=>callback();window.addEventListener('glowhub:refresh',fn);return()=>window.removeEventListener('glowhub:refresh',fn)}};

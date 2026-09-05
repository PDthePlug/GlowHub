import { FormEvent,useEffect,useState } from 'react';
import { api } from '@appdeploy/client';
import { ArrowLeft,ArrowRight,Check,Loader2,MapPin } from 'lucide-react';
import './public-waitlist.css';
import './theme-continuity.css';

type Theme='editorial'|'soft-luxe'|'minimal';
type Service={id:string;name:string;price:number;duration:number;description:string};
type Storefront={name:string;slug:string;location:string;services:Service[];brand?:{theme?:Theme;accent?:string}};
function todayIso(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function messageOf(error:unknown){const e=error as{response?:{data?:{error?:string}};message?:string};return e.response?.data?.error||e.message||'Something went wrong. Try again.'}

export default function PublicWaitlist({slug}:{slug:string}){
  const params=new URLSearchParams(window.location.hash.split('?')[1]||'');
  const[storefront,setStorefront]=useState<Storefront|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[success,setSuccess]=useState(''),[err,setErr]=useState('');
  const[form,setForm]=useState({customerName:'',customerPhone:'',serviceId:params.get('service')||'',date:params.get('date')||''});
  useEffect(()=>{let active=true;api.get(`/api/storefront/${encodeURIComponent(slug)}`).then(r=>{if(!active)return;const next=r.data as Storefront;setStorefront(next);setForm(current=>({...current,serviceId:current.serviceId||next.services[0]?.id||''}))}).catch(()=>active&&setStorefront(null)).finally(()=>active&&setLoading(false));return()=>{active=false}},[slug]);
  async function submit(e:FormEvent){e.preventDefault();if(!storefront)return;setBusy(true);setErr('');try{const r=await api.post(`/api/waitlist/${encodeURIComponent(storefront.slug)}`,form);setSuccess(r.data.message||'You’re on the waitlist.')}catch(error){setErr(messageOf(error))}finally{setBusy(false)}}
  if(loading)return <main className='waitlist-state'><div className='waitlist-spinner'/><p>Opening waitlist…</p></main>;
  if(!storefront||!storefront.services.length)return <main className='waitlist-state'><h1>Waitlist isn’t available right now.</h1><a href='#/'>Back to Discover</a></main>;
  const themeClass=`theme-${storefront.brand?.theme||'editorial'}`;
  if(success)return <main className={`waitlist-page ${themeClass}`}><section className='waitlist-success'><div><Check size={22}/></div><p>Waitlist joined</p><h1>You’re on the list.</h1><span>{success}</span><a href={`#/${storefront.slug}`}>Back to {storefront.name}</a></section></main>;
  return <main className={`waitlist-page ${themeClass}`}><div className='waitlist-shell'><a href={`#/${storefront.slug}/book?service=${form.serviceId}`} className='waitlist-back'><ArrowLeft size={15}/>Back to booking</a><header><p>Waitlist</p><h1>Want this date if a time opens up?</h1><span><MapPin size={14}/>{storefront.name} · {storefront.location}</span></header><form onSubmit={submit}><label><span>Service</span><select value={form.serviceId} onChange={e=>setForm({...form,serviceId:e.target.value})}>{storefront.services.map(service=><option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label><span>Preferred date</span><input type='date' min={todayIso()} required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label><span>Your name</span><input required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} placeholder='Full name'/></label><label><span>WhatsApp / phone</span><input required inputMode='tel' value={form.customerPhone} onChange={e=>setForm({...form,customerPhone:e.target.value})} placeholder='082 123 4567'/></label>{err&&<div className='waitlist-error'>{err}</div>}<button disabled={busy||!form.date||!form.serviceId||!form.customerName.trim()||!form.customerPhone.trim()}>{busy?<Loader2 size={16} className='waitlist-spin'/>:null}Join waitlist <ArrowRight size={14}/></button><small>If a suitable time becomes available, {storefront.name} can contact you.</small></form></div></main>
}

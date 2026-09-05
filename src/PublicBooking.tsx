import { FormEvent,useEffect,useMemo,useState } from 'react';
import { api } from '@appdeploy/client';
import { ArrowLeft,ArrowRight,CalendarDays,Check,Clock3,Loader2,MapPin } from 'lucide-react';
import './public-booking.css';

type Service={id:string;name:string;price:number;duration:number;description:string};
type BookingPolicy={depositRequired:boolean;depositType:'fixed'|'percentage';depositValue:number;cancellationHours?:number;noShowPolicyText?:string};
type Storefront={name:string;slug:string;location:string;services:Service[];bookingPolicy?:BookingPolicy};
type FormState={customerName:string;customerPhone:string;serviceId:string;date:string;time:string;notes:string;attributionCampaignId:string};
function money(value:number){return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(value||0)}
function todayIso(){return new Date().toISOString().slice(0,10)}
function messageOf(error:unknown){const e=error as{response?:{data?:{error?:string}};message?:string};return e.response?.data?.error||e.message||'Something went wrong. Try again.'}
function depositLabel(policy:BookingPolicy){return policy.depositType==='percentage'?`${policy.depositValue}%`:money(policy.depositValue)}

export default function PublicBooking({slug}:{slug:string}){
  const params=useMemo(()=>new URLSearchParams(window.location.hash.split('?')[1]||''),[slug]);
  const preset=params.get('service')||'';
  const campaign=params.get('campaign')||'';
  const[storefront,setStorefront]=useState<Storefront|null>(null),[loading,setLoading]=useState(true),[slots,setSlots]=useState<string[]>([]),[slotsLoading,setSlotsLoading]=useState(false),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[err,setErr]=useState('');
  const[form,setForm]=useState<FormState>({customerName:'',customerPhone:'',serviceId:preset,date:'',time:'',notes:'',attributionCampaignId:campaign});
  useEffect(()=>{let active=true;setLoading(true);api.get(`/api/storefront/${encodeURIComponent(slug)}`).then(r=>{if(!active)return;const next=r.data as Storefront;setStorefront(next);setForm(current=>({...current,serviceId:current.serviceId||next.services[0]?.id||''}))}).catch(()=>active&&setStorefront(null)).finally(()=>active&&setLoading(false));return()=>{active=false}},[slug]);
  useEffect(()=>{if(!storefront||!form.date||!form.serviceId){setSlots([]);return}let active=true;setSlotsLoading(true);setForm(current=>({...current,time:''}));api.get(`/api/availability/${encodeURIComponent(storefront.slug)}?date=${encodeURIComponent(form.date)}&serviceId=${encodeURIComponent(form.serviceId)}`).then(r=>active&&setSlots(r.data.slots||[])).catch(()=>active&&setSlots([])).finally(()=>active&&setSlotsLoading(false));return()=>{active=false}},[storefront,form.date,form.serviceId]);
  const selected=storefront?.services.find(service=>service.id===form.serviceId)||null;
  async function submit(e:FormEvent){e.preventDefault();if(!storefront)return;setBusy(true);setErr('');try{await api.post(`/api/booking/${encodeURIComponent(storefront.slug)}`,form);setSuccess(true);window.scrollTo({top:0,left:0,behavior:'auto'})}catch(error){setErr(messageOf(error))}finally{setBusy(false)}}
  if(loading)return <main className='booking-state'><div className='booking-spinner'/><p>Opening booking…</p></main>;
  if(!storefront||!storefront.services.length)return <main className='booking-state'><h1>Booking isn’t available right now.</h1><p>Return to Discover and choose another business.</p><a href='#/'>Back to Discover</a></main>;
  if(success)return <main className='booking-page'><div className='booking-success'><div className='booking-success-icon'><Check size={22}/></div><p>Booking request sent</p><h1>We’ve sent your request to {storefront.name}.</h1><span>They’ll confirm the appointment with you.</span><div className='booking-success-actions'><a href={`#/${storefront.slug}`}>Back to {storefront.name}</a><a href='#/'>Back to Discover</a></div></div></main>;
  return <main className='booking-page'>
    <div className='booking-shell'>
      <a href={`#/${storefront.slug}`} className='booking-back'><ArrowLeft size={15}/>Back to {storefront.name}</a>
      <header className='booking-intro'><p>Book with {storefront.name}</p><h1>Choose your appointment.</h1><span><MapPin size={14}/>{storefront.location}</span></header>
      <form onSubmit={submit} className='booking-layout'>
        <section className='booking-main'>
          <div className='booking-step'><div className='booking-step-head'><span>1</span><div><p>Service</p><h2>What would you like to book?</h2></div></div><select value={form.serviceId} onChange={e=>setForm({...form,serviceId:e.target.value,time:''})}>{storefront.services.map(service=><option key={service.id} value={service.id}>{service.name} · {money(service.price)}</option>)}</select>{selected&&<div className='booking-service-summary'><div><b>{selected.name}</b>{selected.description&&<p>{selected.description}</p>}</div><div><strong>{money(selected.price)}</strong><span><Clock3 size={13}/>{selected.duration} min</span></div></div>}</div>
          <div className='booking-step'><div className='booking-step-head'><span>2</span><div><p>Date & time</p><h2>When would you like to come in?</h2></div></div><label className='booking-date'><CalendarDays size={17}/><input type='date' min={todayIso()} value={form.date} onChange={e=>setForm({...form,date:e.target.value,time:''})}/></label>{form.date?<div className='booking-times'>{slotsLoading?<span className='booking-muted'>Checking times…</span>:slots.length?slots.map(slot=><button type='button' key={slot} onClick={()=>setForm({...form,time:slot})} className={form.time===slot?'selected':''}>{slot}</button>):<div className='booking-no-times'><b>No times left on this date.</b><a href={`#/${storefront.slug}/waitlist?service=${form.serviceId}&date=${form.date}`}>Join the waitlist <ArrowRight size={13}/></a></div>}</div>:<p className='booking-muted'>Choose a date to see times.</p>}</div>
          <div className='booking-step'><div className='booking-step-head'><span>3</span><div><p>Your details</p><h2>Where should {storefront.name} reach you?</h2></div></div><div className='booking-fields'><label><span>Your name</span><input value={form.customerName} required onChange={e=>setForm({...form,customerName:e.target.value})} placeholder='Full name'/></label><label><span>WhatsApp / phone</span><input value={form.customerPhone} required inputMode='tel' onChange={e=>setForm({...form,customerPhone:e.target.value})} placeholder='082 123 4567'/></label><label className='wide'><span>Anything they should know? <em>Optional</em></span><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder='Add a note'/></label></div></div>
          {storefront.bookingPolicy?.depositRequired&&<div className='booking-deposit'><b>Deposit: {depositLabel(storefront.bookingPolicy)}</b><p>{storefront.name} will confirm the next step with you after receiving your request.</p></div>}
          {err&&<div className='booking-error'>{err}</div>}
        </section>
        <aside className='booking-summary'><p>Your appointment</p>{selected?<><h2>{selected.name}</h2><div className='booking-summary-row'><span>Price</span><b>{money(selected.price)}</b></div><div className='booking-summary-row'><span>Duration</span><b>{selected.duration} min</b></div></>:<h2>Choose a service</h2>}<div className='booking-summary-row'><span>Date</span><b>{form.date||'Choose date'}</b></div><div className='booking-summary-row'><span>Time</span><b>{form.time||'Choose time'}</b></div><button disabled={busy||!form.serviceId||!form.date||!form.time||!form.customerName.trim()||!form.customerPhone.trim()}>{busy?<Loader2 size={16} className='spin'/>:null}Send booking request</button><small>{storefront.name} will confirm your appointment.</small></aside>
      </form>
    </div>
  </main>
}

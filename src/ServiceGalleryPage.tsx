import { useEffect,useMemo,useState } from 'react';
import { ArrowLeft,ArrowRight,Clock3,Images,MessageCircle,X } from 'lucide-react';
import { api } from '@appdeploy/client';
import './service-gallery.css';

type Theme='editorial'|'soft-luxe'|'minimal';
type Service={id:string;name:string;price:number;duration:number;description:string};
type Portfolio={id:string;kind?:'completed'|'before_after';title:string;description:string;serviceId:string;serviceName:string;imageUrl?:string;beforeImageUrl?:string;afterImageUrl?:string};
type Storefront={name:string;ownerName:string;slug:string;whatsapp:string;location:string;tagline:string;services:Service[];portfolio:Portfolio[];brand?:{theme?:Theme;accent?:string;heroImageUrl?:string;logoImageUrl?:string}};
type GalleryImage={url:string;title:string;label:string;itemId:string};

const ACCENTS:Record<string,string>={rose:'#a34f66',plum:'#6b3554',sand:'#8a6547',ink:'#1c1917'};
function money(value:number){return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(value||0)}
function whatsappNumber(phone:string){let d=phone.replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.startsWith('27'))return d;if(d.startsWith('0')&&d.length===10)return`27${d.slice(1)}`;if(d.length===9)return`27${d}`;return d}
function wa(phone:string,text:string){return`https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(text)}`}
function uniqueImages(work:Portfolio[]){const out:GalleryImage[]=[];const seen=new Set<string>();for(const item of work){const add=(url:string|undefined,label:string)=>{if(!url||seen.has(url))return;seen.add(url);out.push({url,title:item.title||item.serviceName,label,itemId:item.id})};if(item.kind==='before_after'){add(item.beforeImageUrl,'Before');add(item.afterImageUrl,'After')}else add(item.imageUrl,'Work photo')}return out}
function usePreviewLimit(){const[limit,setLimit]=useState(3);useEffect(()=>{const media=window.matchMedia('(min-width: 768px)');const sync=()=>setLimit(media.matches?5:3);sync();media.addEventListener?.('change',sync);return()=>media.removeEventListener?.('change',sync)},[]);return limit}

export default function ServiceGalleryPage({slug,serviceId}:{slug:string;serviceId:string}){
  const[storefront,setStorefront]=useState<Storefront|null>(null),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[lightbox,setLightbox]=useState(false);
  const limit=usePreviewLimit();
  useEffect(()=>{setLoading(true);setFailed(false);api.get(`/api/storefront/${encodeURIComponent(slug)}`).then(r=>setStorefront(r.data)).catch(()=>{setFailed(true);setStorefront(null)}).finally(()=>setLoading(false))},[slug]);
  const service=storefront?.services.find(item=>item.id===serviceId)||null;
  const work=useMemo(()=>storefront&&service?storefront.portfolio.filter(item=>item.serviceId===service.id||item.serviceName===service.name):[],[storefront,service]);
  const images=useMemo(()=>uniqueImages(work),[work]);
  const visible=images.slice(0,limit);
  const hidden=Math.max(0,images.length-visible.length);
  useEffect(()=>{if(!lightbox)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[lightbox]);

  if(loading)return <main className='svc-state'><div className='svc-spinner'/><p>Opening service…</p></main>;
  if(failed||!storefront||!service)return <main className='svc-state'><h1>This service isn’t available.</h1><p>Choose another service from the business.</p><a href={`#/${slug}/services`}>Back to services</a></main>;
  const theme=storefront.brand?.theme||'editorial',accent=ACCENTS[storefront.brand?.accent||'rose']||ACCENTS.rose;
  return <main className={`svc-page theme-${theme}`} style={{'--svc-accent':accent} as React.CSSProperties}>
    <header className='svc-topbar'>
      <a href={`#/${storefront.slug}`} className='svc-brand'>{storefront.brand?.logoImageUrl?<img src={storefront.brand.logoImageUrl} alt={`${storefront.name} logo`}/>:<span>{storefront.name}</span>}</a>
      <a href={`#/${storefront.slug}/book?service=${service.id}`} className='svc-top-book'>Book <ArrowRight size={14}/></a>
    </header>
    <div className='svc-shell'>
      <a href={`#/${storefront.slug}/services`} className='svc-back'><ArrowLeft size={15}/>All services</a>
      <section className='svc-intro'>
        <div className='svc-copy'>
          <p className='svc-kicker'>{storefront.location}</p>
          <h1>{service.name}</h1>
          <p className='svc-description'>{service.description||`${service.name} at ${storefront.name}.`}</p>
          <div className='svc-meta'><span><Clock3 size={15}/>{service.duration} min</span><span className='svc-price'>{money(service.price)}</span></div>
          <div className='svc-actions'><a href={`#/${storefront.slug}/book?service=${service.id}`} className='svc-primary'>Book this service <ArrowRight size={16}/></a><a href={wa(storefront.whatsapp,`Hi ${storefront.ownerName}, I’d like to ask about ${service.name}.`)} target='_blank' rel='noreferrer' className='svc-secondary'><MessageCircle size={16}/>Ask on WhatsApp</a></div>
        </div>
        <div className='svc-proof'>
          <div className='svc-proof-head'><div><p>Portfolio</p><h2>{images.length?`${images.length} photo${images.length===1?'':'s'} of ${service.name}`:'No photos yet'}</h2></div>{images.length>0&&<span><Images size={14}/>{images.length}</span>}</div>
          {images.length?<div className={`svc-gallery-preview count-${visible.length}`}>{visible.map((image,index)=><button type='button' onClick={()=>setLightbox(true)} key={`${image.url}-${index}`} className={`svc-shot shot-${index+1}`}><img src={image.url} alt={`${service.name} — ${image.title}`} loading={index===0?'eager':'lazy'}/>{image.label!=='Work photo'&&<span>{image.label}</span>}{index===visible.length-1&&hidden>0&&<b className='svc-more'>+{hidden}<small>View all</small></b>}</button>)}</div>:<div className='svc-empty-photo'><Images size={30}/><p>There are no portfolio photos for this service yet.</p></div>}
          {images.length>visible.length&&<button type='button' className='svc-view-all' onClick={()=>setLightbox(true)}>View all photos <span>{images.length}</span></button>}
        </div>
      </section>
    </div>
    <div className='svc-mobile-bar'><div><b>{money(service.price)}</b><span>{service.duration} min</span></div><a href={`#/${storefront.slug}/book?service=${service.id}`}>Book now</a></div>
    {lightbox&&<div className='svc-lightbox' role='dialog' aria-modal='true' aria-label={`${service.name} portfolio`}><div className='svc-lightbox-head'><div><p>{storefront.name}</p><h2>{service.name}</h2></div><button type='button' aria-label='Close gallery' onClick={()=>setLightbox(false)}><X size={22}/></button></div><div className='svc-lightbox-grid'>{images.map((image,index)=><figure key={`${image.url}-all-${index}`}><img src={image.url} alt={`${service.name} photo ${index+1}`} loading='lazy'/><figcaption><b>{image.title}</b>{image.label!=='Work photo'&&<span>{image.label}</span>}</figcaption></figure>)}</div></div>}
  </main>
}

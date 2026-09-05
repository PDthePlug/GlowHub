import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DiscoverHome from './DiscoverHome';
import './index.css';

function Root(){const[hash,setHash]=useState(window.location.hash);useEffect(()=>{const handler=()=>setHash(window.location.hash);window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);const host=window.location.hostname,isPlatformHost=host.endsWith('.appdeploy.ai')||host==='localhost';return isPlatformHost&&!hash?<DiscoverHome/>:<App/>}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Root />
    </StrictMode>
);

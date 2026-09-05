import { FormEvent,useEffect,useState } from 'react';
import { Loader2,X } from 'lucide-react';
import { auth } from '@appdeploy/client';
import App from './App';
import './business-auth.css';

type Mode='signin'|'signup';

function messageOf(error:unknown){const e=error as{message?:string};return e.message||'Something went wrong. Please try again.'}

export default function BusinessAuth(){
  const[checking,setChecking]=useState(true);
  const[signedIn,setSignedIn]=useState(false);
  const[mode,setMode]=useState<Mode>('signin');
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState('');
  const[success,setSuccess]=useState(false);

  useEffect(()=>{let alive=true;auth.client.auth.getSession().then(({data}:{data:{session:unknown}})=>{if(alive)setSignedIn(Boolean(data.session))}).finally(()=>{if(alive)setChecking(false)});return()=>{alive=false}},[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!email.trim()||password.length<6){setSuccess(false);setMessage('Enter your email and a password with at least 6 characters.');return}
    setBusy(true);setMessage('');setSuccess(false);
    try{
      if(mode==='signin'){
        const{error}=await auth.client.auth.signInWithPassword({email:email.trim(),password});
        if(error)throw error;
        setSignedIn(true);
      }else{
        const{data,error}=await auth.client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}${window.location.pathname}?auth=confirmation`}});
        if(error)throw error;
        if(data.session){setSignedIn(true);return}
        setSuccess(true);setMessage('Account created. Check your email to confirm it, then return here to continue setting up your business.');
      }
    }catch(error){setSuccess(false);setMessage(messageOf(error))}finally{setBusy(false)}
  }

  if(checking)return <div className='gh-auth-page gh-auth-loading'><Loader2 className='animate-spin' size={20}/>Checking your session…</div>;
  if(signedIn)return <App/>;

  return <div className='gh-auth-page'>
    <a className='gh-auth-back' href='#/' aria-label='Back to Glow Hub'><X size={20}/></a>
    <main className='gh-auth-panel'>
      <div className='gh-auth-mark-native'>G</div>
      <p className='gh-auth-kicker-native'>Glow Hub business account</p>
      <h1>{mode==='signin'?'Sign in to your business.':'Create your business account.'}</h1>
      <p className='gh-auth-copy-native'>{mode==='signin'?'Use the email address and password for your Glow Hub account.':'Create the account you will use to manage your business on Glow Hub.'}</p>
      <form onSubmit={submit} className='gh-auth-form' autoComplete='on'>
        <label>Email<input autoFocus inputMode='email' autoCapitalize='none' autoCorrect='off' spellCheck={false} type='email' autoComplete='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@example.com'/></label>
        <label>Password<input type='password' autoComplete={mode==='signin'?'current-password':'new-password'} minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder='At least 6 characters'/></label>
        {message&&<p className={success?'gh-auth-success-native':'gh-auth-error-native'}>{message}</p>}
        <button className='gh-auth-primary-native' disabled={busy} type='submit'>{busy&&<Loader2 className='animate-spin' size={17}/>} {mode==='signin'?'Sign in':'Create account'}</button>
        <button className='gh-auth-secondary-native' disabled={busy} type='button' onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('');setSuccess(false)}}>{mode==='signin'?'Create account':'I already have an account'}</button>
      </form>
    </main>
  </div>
}

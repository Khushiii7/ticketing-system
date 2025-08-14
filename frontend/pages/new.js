import { useState } from 'react';
import { authHeader } from '../lib/api';
import { useRouter } from 'next/router';

export default function NewTicket(){
  const [subject,setSubject]=useState('');
  const [description,setDescription]=useState('');
  const [priority,setPriority]=useState('LOW');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/tickets',{
      method:'POST',
      headers:{'Content-Type':'application/json', ...authHeader()},
      body: JSON.stringify({subject,description,priority})
    });
    if(res.ok) router.push('/dashboard');
    else alert('Failed');
  }

  return (<div className='container'>
    <h2>New Ticket</h2>
    <form onSubmit={submit}>
      <div><input placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} /></div>
      <div><textarea placeholder='Describe' value={description} onChange={e=>setDescription(e.target.value)} /></div>
      <div>
        <select value={priority} onChange={e=>setPriority(e.target.value)}>
          <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
        </select>
      </div>
      <div><button type='submit'>Create</button></div>
    </form>
  </div>);
}

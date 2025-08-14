import { useRouter } from 'next/router';
import useSWR from 'swr';
import { authHeader } from '../../lib/api';
import { useState } from 'react';

const fetcher = url => fetch(url,{headers:{...authHeader()}}).then(r=>r.json());

export default function TicketDetail(){
  const router = useRouter();
  const { id } = router.query;
  const { data: ticket } = useSWR(id?`http://localhost:8080/api/tickets/${id}`:null, fetcher);
  const [text,setText]=useState('');

  async function addComment(){
    await fetch(`http://localhost:8080/api/tickets/${id}/comment`,{
      method:'POST', headers:{'Content-Type':'application/json', ...authHeader()},
      body: JSON.stringify({text})
    });
    setText('');
    router.replace(router.asPath);
  }

  if(!ticket) return <div className='container'>Loading...</div>;
  return (<div className='container'>
    <button onClick={()=>router.back()}>Back</button>
    <h2>{ticket.subject}</h2>
    <div>Status: {ticket.status} | Priority: {ticket.priority}</div>
    <p>{ticket.description}</p>
    <h3>Comments</h3>
    {ticket.comments && ticket.comments.map(c=>(
      <div key={c.id} style={{marginBottom:8}}>
        <strong>{c.author?c.author.username:'unknown'}</strong> - <em>{new Date(c.createdAt).toLocaleString()}</em>
        <div>{c.text}</div>
      </div>
    ))}
    <div>
      <textarea value={text} onChange={e=>setText(e.target.value)} />
      <div><button onClick={addComment}>Add Comment</button></div>
    </div>
  </div>);
}

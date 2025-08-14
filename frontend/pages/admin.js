import useSWR from 'swr';
import { authHeader } from '../lib/api';
import { useRouter } from 'next/router';

const fetcher = url => fetch(url,{headers:{...authHeader()}}).then(r=>r.json());

export default function Admin(){
  const router = useRouter();
  const { data: users } = useSWR('http://localhost:8080/api/admin/users', fetcher);
  const { data: tickets } = useSWR('http://localhost:8080/api/admin/tickets', fetcher);

  return (<div className='container'>
    <button onClick={()=>router.push('/dashboard')}>Back</button>
    <h2>Admin Panel</h2>
    <h3>Users</h3>
    {!users && <div>Loading...</div>}
    {users && users.map(u=>(
      <div key={u.id}>{u.username} - Roles: {(u.roles||[]).join(',')}</div>
    ))}

    <h3>All Tickets</h3>
    {!tickets && <div>Loading...</div>}
    {tickets && tickets.map(t=>(
      <div key={t.id} className='ticket'>
        <strong>{t.subject}</strong><div>Status: {t.status}</div>
      </div>
    ))}
  </div>);
}

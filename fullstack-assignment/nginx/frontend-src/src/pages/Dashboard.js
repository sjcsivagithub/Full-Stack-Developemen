import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/projects', token);
      setProjects(data);
    } catch (e) {
      setErr(e.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const p = await apiFetch('/projects', token, { method: 'POST', body: { name } });
      setName('');
      setProjects(prev => [p, ...prev]);
    } catch (e) {
      setErr(e.message || JSON.stringify(e));
    }
  };

  return (
    <div style={{padding:20}}>
      <button onClick={logout}>Logout</button>
      <h2>Projects</h2>
      <form onSubmit={create}>
        <input placeholder="New project name" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {projects.map(p => (
            <li key={p._id}>
              <Link to={`/project/${p._id}`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      )}
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  );
}

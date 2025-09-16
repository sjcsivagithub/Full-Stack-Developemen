import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const data = await apiFetch('/auth/login', null, { method: 'POST', body: { email, password } });
      login(data);
      nav('/');
    } catch (e) {
      setErr(e.message || JSON.stringify(e));
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <form onSubmit={submit}>
        <div>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      <small>Don't have account? <Link to="/register">Register</Link></small>
    </div>
  );
}

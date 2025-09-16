import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { io } from 'socket.io-client';

let socket;

export default function ProjectPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await apiFetch(`/projects/${id}`, token);
        setProject(p);
        const ts = await apiFetch(`/projects/${id}/tasks`, token);
        setTasks(ts);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();

    socket = io(); // connect to same origin (nginx serves)
    socket.emit('joinProject', id);

    socket.on('taskCreated', (task) => setTasks(prev => [task, ...prev]));
    socket.on('taskUpdated', (task) => setTasks(prev => prev.map(t => t._id === task._id ? task : t)));
    socket.on('taskDeleted', ({ id: tid }) => setTasks(prev => prev.filter(t => t._id !== tid)));

    return () => {
      if (socket) {
        socket.emit('leaveProject', id);
        socket.disconnect();
      }
    };
  }, [id, token]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/projects/${id}/tasks`, token, { method: 'POST', body: { title } });
      setTitle('');
      // real-time will add it
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await apiFetch(`/projects/${id}/tasks/${taskId}`, token, { method: 'PUT', body: { status: newStatus } });
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiFetch(`/projects/${id}/tasks/${taskId}`, token, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const filtered = tasks.filter(t => !statusFilter || t.status === statusFilter);

  return (
    <div style={{padding:20}}>
      <h2>Project: {project?.name}</h2>
      <form onSubmit={createTask}>
        <input placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>

      <div>
        <label>Filter: </label>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {loading ? <p>Loading tasks...</p> : (
        <ul>
          {filtered.map(t => (
            <li key={t._id}>
              <strong>{t.title}</strong> — {t.status}
              <button onClick={()=>updateStatus(t._id, t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo')}>Toggle</button>
              <button onClick={()=>deleteTask(t._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

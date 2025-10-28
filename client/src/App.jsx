import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // attach auth header + 401 handling
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    const resId = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          setNotes([]);
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/notes');
        setNotes(res.data);
      } catch {
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        authMode === 'login'
          ? { email: authForm.email.trim(), password: authForm.password }
          : {
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            };

      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleCreateOrUpdateNote = async (e) => {
    e.preventDefault();
    setError('');
    const title = noteForm.title.trim();
    const content = noteForm.content.trim();

    if (!title) return setError('Note title is required');

    try {
      if (editingId) {
        const res = await api.put(`/notes/${editingId}`, { title, content });
        setNotes((prev) => prev.map((n) => (n._id === editingId ? res.data : n)));
        setEditingId(null);
      } else {
        const res = await api.post('/notes', { title, content });
        setNotes((prev) => [res.data, ...prev]);
      }
      setNoteForm({ title: '', content: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setNoteForm({ title: '', content: '' });
      }
    } catch {
      setError('Failed to delete note');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setNotes([]);
    setError('');
    setEditingId(null);
    setNoteForm({ title: '', content: '' });
  };

  if (!token) {
    return (
      <div className="container">
        <h1>Notes App</h1>
        <div className="card">
          <div className="tabs">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => { setAuthMode('login'); setError(''); }}
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => { setAuthMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="form">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Name"
                minLength={2}
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              minLength={6}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Your Notes</h1>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      <form className="form" onSubmit={handleCreateOrUpdateNote}>
        <input
          type="text"
          placeholder="Note title"
          value={noteForm.title}
          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Note content"
          value={noteForm.content}
          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
          rows={4}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Update Note' : 'Add Note'}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setNoteForm({ title: '', content: '' });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading…</p>}

      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note" key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="note-actions" style={{ display: 'flex', gap: 8 }}>
              <button
                className="secondary"
                onClick={() => {
                  setNoteForm({ title: note.title, content: note.content });
                  setEditingId(note._id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Edit
              </button>
              <button className="secondary" onClick={() => handleDelete(note._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && notes.length === 0 && <p>No notes yet. Create your first note!</p>}
      </div>
    </div>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const App = () => {
  const [token, setToken] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      setError('Failed to fetch notes');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const res = await api.post(endpoint, payload);
      setToken(res.data.token);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setError('');

    if (!noteForm.title.trim()) {
      setError('Note title is required');
      return;
    }

    try {
      const res = await api.post(
        '/notes',
        { title: noteForm.title, content: noteForm.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setNoteForm({ title: '', content: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  if (!token) {
    return (
      <div className="container">
        <h1>Notes App</h1>
        <div className="card">
          <div className="tabs">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="form">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Name"
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
        <button className="secondary" onClick={() => setToken(null)}>
          Log out
        </button>
      </header>
      <form className="form" onSubmit={handleCreateNote}>
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
        <button type="submit">Add Note</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note" key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button className="secondary" onClick={() => handleDelete(note._id)}>
              Delete
            </button>
          </div>
        ))}
        {notes.length === 0 && <p>No notes yet. Create your first note!</p>}
      </div>
    </div>
  );
};

export default App;

// src/App.jsx
import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Chat from './pages/Chat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import VOCEngine from './pages/pm/VOCEngine.jsx';
import CompetitorWatchtower from './pages/pm/CompetitorWatchtower.jsx';
import PRDWriter from './pages/pm/PRDWriter.jsx';
import LaunchAuditor from './pages/pm/LaunchAuditor.jsx';

const SESSION_KEY = 'workmind_history';
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(h)); } catch {}
}

export default function App() {
  const [history, setHistory] = useState(loadHistory);

  const handleNewMessage = useCallback(({ userMsg, aiMsg }) => {
    setHistory(prev => {
      const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
      const s = { id: Date.now(), title: userMsg.text.slice(0, 60), date: today, time: userMsg.time, msgCount: 2, messages: [userMsg, aiMsg] };
      const updated = [s, ...prev].slice(0, 50);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleDeleteSession = useCallback((id) => {
    setHistory(prev => { const u = prev.filter(s => s.id !== id); saveHistory(u); return u; });
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar history={history} />
        <main className="flex-1 min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Chat onNewMessage={handleNewMessage} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History sessions={history} onSelect={() => {}} onDelete={handleDeleteSession} />} />
            <Route path="/pm/voc" element={<VOCEngine />} />
            <Route path="/pm/watchtower" element={<CompetitorWatchtower />} />
            <Route path="/pm/prd" element={<PRDWriter />} />
            <Route path="/pm/audit" element={<LaunchAuditor />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

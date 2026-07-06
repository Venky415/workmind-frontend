// components/MemoryPanel.jsx
// Shows what WorkMind AI currently remembers about the user
// Accessible from the chat header

import { useState, useEffect } from 'react';
import { Brain, Trash2, RefreshCw, X, MapPin, Clock, Folder, TrendingUp, Star, History, ChevronRight } from 'lucide-react';

function MemorySection({ icon: Icon, title, items, color = 'indigo' }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-[#4F46E5]', dot: 'bg-[#4F46E5]' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  };
  const c = colors[color];
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4">
      <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${c.text}`}>
        <Icon size={12} />
        {title}
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg ${c.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${c.dot}`} />
            <span className="text-xs text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MemoryPanel({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/profile');
      setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearMemory = async () => {
    if (!confirm('Clear all memory? The AI will start fresh and forget your preferences.')) return;
    setClearing(true);
    await fetch('/api/memory/profile', { method: 'DELETE' });
    await load();
    setClearing(false);
  };

  useEffect(() => { load(); }, []);

  const { profile, contextPreview } = data || {};
  const hasMemory = profile?.totalConversations > 0;

  // Build display items from profile
  const prefItems = [];
  const p = profile?.preferences || {};
  if (p.cab_pickup && p.cab_drop) prefItems.push(`Usual cab: ${p.cab_pickup} → ${p.cab_drop}`);
  if (p.cab_time) prefItems.push(`Preferred time: ${p.cab_time}`);
  if (p.vehicle_type) prefItems.push(`Vehicle: ${p.vehicle_type}`);
  if (p.project_code) prefItems.push(`Project code: ${p.project_code}`);
  if (p.expense_category) prefItems.push(`Expense category: ${p.expense_category}`);
  Object.entries(p).forEach(([k, v]) => {
    const known = ['cab_pickup','cab_drop','cab_time','vehicle_type','project_code','expense_category'];
    if (!known.includes(k)) prefItems.push(`${k.replace(/_/g, ' ')}: ${v}`);
  });

  const patternItems = [];
  const pt = profile?.patterns || {};
  if (pt.timesheet_missing_day) patternItems.push(`Always misses ${pt.timesheet_missing_day} timesheet`);
  if (pt.frequent_route) patternItems.push('Books same cab route frequently');
  if (pt.common_ticket_type) patternItems.push(`Most common ticket: ${pt.common_ticket_type}`);
  Object.entries(pt).forEach(([k, v]) => {
    const known = ['timesheet_missing_day','frequent_route','common_ticket_type'];
    if (!known.includes(k) && v !== 'true' && v !== true) patternItems.push(`${k.replace(/_/g, ' ')}: ${v}`);
  });

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl w-80 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">AI Memory</div>
              <div className="text-[10px] text-gray-400">
                {hasMemory ? `${profile.totalConversations} conversations remembered` : 'No memory yet'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={load} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !hasMemory ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain size={20} className="text-[#4F46E5] opacity-40" />
              </div>
              <div className="text-sm font-medium text-gray-500 mb-1">Nothing remembered yet</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Have a conversation — book a cab, raise a ticket, or fill your timesheet. The AI will start learning your preferences automatically.
              </div>
            </div>
          ) : (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-base font-bold text-[#4F46E5]">{profile.totalConversations}</div>
                  <div className="text-[10px] text-gray-400">Conversations</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-base font-bold text-emerald-600">{profile.history?.length || 0}</div>
                  <div className="text-[10px] text-gray-400">Actions logged</div>
                </div>
              </div>

              <MemorySection icon={MapPin} title="Preferences" items={prefItems} color="indigo" />
              <MemorySection icon={TrendingUp} title="Patterns observed" items={patternItems} color="amber" />
              <MemorySection icon={Star} title="Important facts" items={profile.importantFacts} color="blue" />
              <MemorySection icon={History} title="Recent actions" items={profile.history?.slice(0, 5)} color="emerald" />

              {/* Context preview */}
              {contextPreview && (
                <div className="mt-2">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    What AI sees at start of each chat
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                      {contextPreview}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasMemory && (
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={clearMemory} disabled={clearing}
              className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-500 text-xs rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
              <Trash2 size={12} />
              {clearing ? 'Clearing...' : 'Clear all memory'}
            </button>
            <div className="text-[10px] text-gray-400 text-center mt-1.5">
              Memory updates automatically after each conversation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

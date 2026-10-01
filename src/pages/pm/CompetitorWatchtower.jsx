// pages/pm/CompetitorWatchtower.jsx
import { useState } from 'react';
import { Eye, Plus, Trash2, Play, Loader, AlertTriangle, CheckCircle, TrendingUp, Bell } from 'lucide-react';

const THREAT_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};
const CHANGE_TYPE_ICON = { pricing: '💰', feature: '✨', positioning: '🎯', other: '📝', none: '✓' };

function CompetitorRow({ comp, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid grid-cols-3 gap-2">
        <input value={comp.name} onChange={e => onChange({ ...comp, name: e.target.value })}
          placeholder="Competitor name" className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4F46E5]" />
        <input value={comp.url} onChange={e => onChange({ ...comp, url: e.target.value })}
          placeholder="Changelog/pricing URL" className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4F46E5] col-span-2" />
      </div>
      <button onClick={onRemove} className="p-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ResultCard({ item }) {
  if (!item.has_changes) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{item.competitor}</div>
          <div className="text-xs text-gray-400 mt-0.5">No changes detected</div>
        </div>
        <span className="text-[10px] text-gray-400">{item.url}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-base flex-shrink-0">
          {CHANGE_TYPE_ICON[item.change_type] || '📝'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{item.competitor}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${THREAT_STYLES[item.threat_level]}`}>
              {item.threat_level} threat
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">{item.change_type}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{item.url}</div>
        </div>
        <Bell size={14} className="text-amber-500 flex-shrink-0" />
      </div>

      <div className="p-4 space-y-3">
        {item.brief && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">3-line brief</div>
            <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">{item.brief}</p>
          </div>
        )}

        {item.changes?.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Changes detected</div>
            <ul className="space-y-1">
              {item.changes.map((c, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <AlertTriangle size={10} className="flex-shrink-0 mt-0.5 text-amber-400" />{c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.recommended_response && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-[#4F46E5] uppercase tracking-wide mb-1">Recommended response</div>
            <p className="text-xs text-indigo-800">{item.recommended_response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompetitorWatchtower() {
  const [competitors, setCompetitors] = useState([
    { name: '', url: '', content: '' },
    { name: '', url: '', content: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const update = (i, val) => setCompetitors(prev => prev.map((c, j) => j === i ? val : c));
  const add = () => setCompetitors(prev => [...prev, { name: '', url: '', content: '' }]);
  const remove = (i) => setCompetitors(prev => prev.filter((_, j) => j !== i));

  const run = async (useDemo = false) => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('https://workmind-backend-c2ls.onrender.com/api/pm/watchtower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: useDemo ? [] : competitors.filter(c => c.name), useDemo })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const changesCount = result?.results?.filter(r => r.has_changes).length || 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center"><Eye size={15} className="text-white" /></div>
            <h1 className="text-lg font-semibold text-gray-900">Competitor Watchtower</h1>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#4F46E5] rounded-full border border-indigo-100 font-medium">Tool 2</span>
          </div>
          <p className="text-xs text-gray-500 ml-[42px]">Give it rival changelog and pricing URLs. It diffs against yesterday and sends a 3-line brief only when something actually changes. Stateful — holds memory across daily runs.</p>
        </div>

        {!result && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">Competitors to track</label>
              <button onClick={() => run(true)} disabled={loading}
                className="text-xs px-3 py-1.5 border border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-indigo-50 disabled:opacity-50">
                Try with demo data
              </button>
            </div>
            <div className="space-y-2.5 mb-4">
              {competitors.map((c, i) => (
                <CompetitorRow key={i} comp={c} onChange={v => update(i, v)} onRemove={() => remove(i)} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={add} className="flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline">
                <Plus size={12} /> Add competitor
              </button>
              <button onClick={() => run(false)} disabled={loading || !competitors.some(c => c.name)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-40 font-medium">
                {loading ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                {loading ? 'Scanning...' : 'Run watchtower'}
              </button>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="text-[10px] font-semibold text-blue-700 mb-1">💡 How stateful tracking works</div>
              <p className="text-xs text-blue-700">Paste competitor changelog content in the content field. On first run it snapshots. On every subsequent run it diffs — you only hear about it when something actually changes.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Eye size={24} className="animate-pulse text-[#4F46E5]" />
            <div className="text-sm text-gray-500">Scanning competitors...</div>
            <div className="text-xs text-gray-400">Diffing against yesterday's snapshot</div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 mb-4">⚠ {error}</div>}

        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {changesCount > 0 ? `${changesCount} change${changesCount > 1 ? 's' : ''} detected` : 'All clear — no changes'}
                </div>
                <div className="text-xs text-gray-400">{result.total_checked} competitors checked · {new Date(result.checked_at).toLocaleTimeString()}</div>
              </div>
              <button onClick={() => setResult(null)} className="text-xs text-[#4F46E5] hover:underline">← New scan</button>
            </div>

            {result.daily_brief && changesCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bell size={13} className="text-amber-600" />
                  <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Daily brief</div>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">{result.daily_brief}</p>
              </div>
            )}

            <div className="space-y-3">
              {result.results?.map((item, i) => <ResultCard key={i} item={item} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

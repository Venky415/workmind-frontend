// components/WatchtowerWidget.jsx
// Shows live Competitor Watchtower alerts inside WorkMind dashboard

import { useState, useEffect } from 'react';
import { Eye, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, TrendingUp, Bell } from 'lucide-react';

const THREAT_STYLES = {
  high:   { dot: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-50 text-red-700 border-red-200' },
  medium: { dot: 'bg-amber-400',  text: 'text-amber-600',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { dot: 'bg-emerald-500',text: 'text-emerald-600',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function timeAgo(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function WatchtowerWidget() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://workmind-backend-production.up.railway.app/api/watchtower/summary');
      const json = await res.json();
      setData(json);
      setError(json.error && !json.online);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Offline state ────────────────────────────────────────────────────────────
  if (error || (data && !data.online)) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-gray-300" />
            <span className="text-sm font-medium text-gray-900">Competitor Watchtower</span>
          </div>
          <button onClick={load} className="text-gray-300 hover:text-gray-500">
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-gray-500">Watchtower offline</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Start it: <code className="bg-gray-100 px-1 rounded">cd competitor-watchtower/backend && npm run dev</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-40 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const hasAlert = data?.todayChanges > 0;

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm ${hasAlert ? 'border-amber-200' : 'border-gray-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${hasAlert ? 'bg-amber-100' : 'bg-indigo-50'}`}>
            <Eye size={13} className={hasAlert ? 'text-amber-600' : 'text-[#4F46E5]'} />
          </div>
          <span className="text-sm font-semibold text-gray-900">Competitor Watchtower</span>
          {hasAlert && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium border border-amber-200">
              <Bell size={9} /> {data.todayChanges} alert{data.todayChanges > 1 ? 's' : ''} today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-gray-300 hover:text-gray-500 transition-colors">
            <RefreshCw size={12} />
          </button>
          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-[#4F46E5] hover:underline flex items-center gap-0.5">
            Open <ExternalLink size={9} />
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Watching', value: data?.activeCompetitors || 0 },
          { label: 'Today', value: data?.todayChanges || 0, alert: hasAlert },
          { label: 'Last scan', value: timeAgo(data?.lastScan), small: true },
        ].map(({ label, value, alert, small }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
            <div className={`font-semibold ${small ? 'text-xs' : 'text-base'} ${alert ? 'text-amber-600' : 'text-gray-800'}`}>
              {value}
            </div>
            <div className="text-[10px] text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent changes feed */}
      {data?.recentChanges?.length > 0 ? (
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Recent changes
          </div>
          <div className="space-y-1.5">
            {data.recentChanges.map((change, i) => {
              const t = THREAT_STYLES[change.threatLevel] || THREAT_STYLES.low;
              return (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${t.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-800">{change.competitorName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${t.badge}`}>
                        {change.threatLevel?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                      {change.changes?.[0] || change.brief || 'Change detected'}
                    </div>
                    <div className="text-[10px] text-gray-300 mt-0.5">{timeAgo(change.analyzedAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
          <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-emerald-700">All clear</div>
            <div className="text-[10px] text-emerald-600">No changes detected recently</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
        <TrendingUp size={11} /> View full Watchtower dashboard
      </a>
    </div>
  );
}

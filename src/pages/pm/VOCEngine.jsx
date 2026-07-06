// pages/pm/VOCEngine.jsx
import { useState } from 'react';
import { MessageSquare, Upload, Play, Star, TrendingUp, Quote, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const SEVERITY_COLOR = { 10: '#059669', 9: '#059669', 8: '#0891b2', 7: '#0891b2', 6: '#d97706', 5: '#d97706', 4: '#dc2626', 3: '#dc2626' };
const SENTIMENT_STYLES = {
  negative: 'bg-red-50 text-red-700 border border-red-100',
  mixed: 'bg-amber-50 text-amber-700 border border-amber-100',
  positive: 'bg-emerald-50 text-emerald-700 border border-emerald-100'
};

function ScoreBar({ score, max = 10 }) {
  const colors = score >= 8 ? '#dc2626' : score >= 6 ? '#d97706' : '#4F46E5';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(score / max) * 100}%`, background: colors }} />
      </div>
      <span className="text-xs font-semibold w-6 text-right" style={{ color: colors }}>{score}</span>
    </div>
  );
}

function ThemeCard({ theme, rank }) {
  const [open, setOpen] = useState(rank === 1);
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setOpen(o => !o)}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: rank === 1 ? '#dc2626' : rank === 2 ? '#d97706' : rank <= 4 ? '#4F46E5' : '#6b7280' }}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{theme.theme}</div>
          <div className="text-xs text-gray-400 mt-0.5">{theme.frequency} mentions · {theme.frequency_pct}% of all feedback</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_STYLES[theme.sentiment]}`}>{theme.sentiment}</span>
          <div className="text-right">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-base font-bold" style={{ color: SEVERITY_COLOR[theme.overall_score] || '#4F46E5' }}>{theme.overall_score}/10</div>
          </div>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-1">Frequency</div>
              <ScoreBar score={theme.frequency_pct / 10} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-1">Revenue impact</div>
              <ScoreBar score={theme.revenue_impact_score} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-1">Urgency</div>
              <ScoreBar score={theme.urgency_score} />
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Quote size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-800 italic leading-relaxed">"{theme.representative_quote}"</p>
            </div>
          </div>
          {theme.sample_tickets?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Sample tickets</div>
              <div className="space-y-1">
                {theme.sample_tickets.map((t, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-300 flex-shrink-0">—</span> {t}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-emerald-700 mb-1">RECOMMENDED ACTION</div>
            <div className="text-xs text-emerald-800">{theme.recommended_action}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VOCEngine() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async (useDemo = false) => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('https://workmind-backend-production.up.railway.app/api/pm/voc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackText: feedback, source: 'mixed', dateRange: '90 days', useDemo })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center"><MessageSquare size={15} className="text-white" /></div>
            <h1 className="text-lg font-semibold text-gray-900">Voice-of-Customer Engine</h1>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#4F46E5] rounded-full border border-indigo-100 font-medium">Tool 1</span>
          </div>
          <p className="text-xs text-gray-500 ml-[42px]">Paste 90 days of support tickets, app reviews, and call transcripts. AI clusters by theme, scores by frequency + revenue impact, returns the top 5 with representative quotes.</p>
        </div>

        {!result && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Paste your customer feedback</label>
              <button onClick={() => run(true)} disabled={loading}
                className="text-xs px-3 py-1.5 border border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50">
                Try with demo data
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder={`Paste support tickets, app reviews, call transcripts...\n\nExample:\n[SUPPORT TICKET] App crashes on PDF export. High priority.\n[APP REVIEW] ★★☆☆☆ "Onboarding is very confusing..."\n[CALL TRANSCRIPT] Customer: mobile app is too slow...`}
              className="w-full h-52 resize-none border border-gray-200 rounded-lg p-3 text-xs text-gray-700 placeholder-gray-300 outline-none focus:border-[#4F46E5] font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-400">{feedback.split('\n').filter(Boolean).length} lines pasted</div>
              <button onClick={() => run(false)} disabled={loading || !feedback.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity font-medium">
                {loading ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                {loading ? 'Analyzing...' : 'Run analysis'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader size={24} className="animate-spin text-[#4F46E5]" />
            <div className="text-sm text-gray-500">Clustering feedback themes...</div>
            <div className="text-xs text-gray-400">Scoring by frequency + revenue impact</div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 mb-4">⚠ {error}</div>}

        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Analysis complete</div>
                <div className="text-xs text-gray-400">{result.total_feedback_items} items · {result.top_themes?.length} themes identified</div>
              </div>
              <button onClick={() => setResult(null)} className="text-xs text-[#4F46E5] hover:underline">← New analysis</button>
            </div>

            {result.executive_summary && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold text-[#4F46E5] uppercase tracking-wide mb-1.5">Executive summary</div>
                <p className="text-xs text-indigo-900 leading-relaxed">{result.executive_summary}</p>
              </div>
            )}

            <div className="space-y-3">
              {result.top_themes?.map((theme, i) => (
                <ThemeCard key={i} theme={theme} rank={i + 1} />
              ))}
            </div>

            {result.quick_wins?.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <TrendingUp size={11} /> Quick wins
                </div>
                <ul className="space-y-1.5">
                  {result.quick_wins.map((w, i) => (
                    <li key={i} className="text-xs text-emerald-800 flex items-start gap-1.5">
                      <Star size={10} className="flex-shrink-0 mt-0.5 text-emerald-500" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

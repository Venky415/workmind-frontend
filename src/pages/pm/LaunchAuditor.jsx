// pages/pm/LaunchAuditor.jsx
import { useState } from 'react';
import { Rocket, Plus, Trash2, Play, Loader, AlertTriangle, CheckCircle, XCircle, HelpCircle, Shield } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: XCircle, iconColor: 'text-red-500' },
  major:    { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-500' },
  minor:    { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: HelpCircle, iconColor: 'text-blue-500' },
};

const VERDICT_STYLES = {
  READY:      { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  NEEDS_WORK: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
  NOT_READY:  { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
};

const DOC_TYPES = ['release_notes', 'help_article', 'prd', 'announcement'];

function DocCard({ doc, onChange, onRemove }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <select value={doc.type} onChange={e => onChange({ ...doc, type: e.target.value })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#4F46E5] bg-white">
          {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input value={doc.title} onChange={e => onChange({ ...doc, title: e.target.value })}
          placeholder="Document title" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4F46E5] bg-white" />
        <button onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
      <textarea value={doc.content} onChange={e => onChange({ ...doc, content: e.target.value })}
        placeholder="Paste document content here..."
        rows={4}
        className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder-gray-300 outline-none focus:border-[#4F46E5] bg-white font-mono leading-relaxed" />
    </div>
  );
}

function IssueCard({ item, type }) {
  const s = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.minor;
  const Icon = s.icon;
  return (
    <div className={`border rounded-xl p-4 ${s.bg}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={14} className={`${s.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.badge}`}>{item.severity}</span>
            {type === 'contradiction' && item.doc_a && (
              <span className="text-[10px] text-gray-500">{item.doc_a} ↔ {item.doc_b}</span>
            )}
            {type === 'gap' && item.where && (
              <span className="text-[10px] text-gray-500">Missing in: {item.where}</span>
            )}
          </div>
          {type === 'contradiction' && (
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
              <div className="bg-white rounded-lg p-2 border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-0.5">{item.doc_a} says</div>
                <div className="text-gray-700">{item.says_a}</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-0.5">{item.doc_b} says</div>
                <div className="text-gray-700">{item.says_b}</div>
              </div>
            </div>
          )}
          {type === 'gap' && <p className="text-xs text-gray-700 mb-1.5">{item.gap}</p>}
          {item.fix && (
            <div className="bg-white rounded-lg p-2 border border-green-100 text-xs text-emerald-700">
              <span className="font-medium">Fix: </span>{item.fix}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LaunchAuditor() {
  const [featureName, setFeatureName] = useState('');
  const [docs, setDocs] = useState([
    { type: 'release_notes', title: '', content: '' },
    { type: 'help_article', title: '', content: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const updateDoc = (i, val) => setDocs(prev => prev.map((d, j) => j === i ? val : d));
  const addDoc = () => setDocs(prev => [...prev, { type: 'help_article', title: '', content: '' }]);
  const removeDoc = (i) => setDocs(prev => prev.filter((_, j) => j !== i));

  const run = async (useDemo = false) => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('https://workmind-backend-c2ls.onrender.com/api/pm/audit', {
      signal: AbortSignal.timeout(120000),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: docs.filter(d => d.content), featureName, releaseVersion: '', useDemo })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const v = result?.verdict ? VERDICT_STYLES[result.verdict] : null;
  const VIcon = v?.icon;
  const totalIssues = (result?.contradictions?.length || 0) + (result?.missing_steps?.length || 0);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center"><Rocket size={15} className="text-white" /></div>
            <h1 className="text-lg font-semibold text-gray-900">Launch-Readiness Auditor</h1>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#4F46E5] rounded-full border border-indigo-100 font-medium">Tool 5</span>
          </div>
          <p className="text-xs text-gray-500 ml-[42px]">Paste your docs, release notes, and help articles before ship. AI finds contradictions, missing steps, and the one question users will definitely ask that nobody answered.</p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Feature / release name</label>
                    <input value={featureName} onChange={e => setFeatureName(e.target.value)}
                      placeholder="e.g. AI Meeting Summaries v3.2"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4F46E5] w-64" />
                  </div>
                </div>
                <button onClick={() => run(true)} disabled={loading}
                  className="text-xs px-3 py-1.5 border border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-indigo-50 disabled:opacity-50">
                  Try with demo data
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {docs.map((doc, i) => (
                  <DocCard key={i} doc={doc} onChange={v => updateDoc(i, v)} onRemove={() => removeDoc(i)} />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={addDoc} className="flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline">
                  <Plus size={12} /> Add document
                </button>
                <button onClick={() => run(false)} disabled={loading || !docs.some(d => d.content)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-40 font-medium">
                  {loading ? <Loader size={12} className="animate-spin" /> : <Shield size={12} />}
                  {loading ? 'Auditing...' : 'Run audit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Shield size={24} className="animate-pulse text-[#4F46E5]" />
            <div className="text-sm text-gray-500">Auditing documents...</div>
            <div className="text-xs text-gray-400">Finding contradictions, gaps, and unanswered questions</div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 mb-4">⚠ {error}</div>}

        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">{result.feature || featureName} — Audit complete</div>
              <button onClick={() => setResult(null)} className="text-xs text-[#4F46E5] hover:underline">← New audit</button>
            </div>

            {/* Verdict */}
            {v && (
              <div className={`border rounded-xl p-5 ${v.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <VIcon size={20} className={v.text} />
                    <div>
                      <div className={`text-base font-bold ${v.text}`}>{result.verdict?.replace('_', ' ')}</div>
                      <div className={`text-xs ${v.text} opacity-75`}>{totalIssues} issue{totalIssues !== 1 ? 's' : ''} found · {result.estimated_support_tickets_prevented} support tickets prevented if fixed</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500">Launch score</div>
                    <div className={`text-3xl font-bold ${v.text}`}>{result.audit_score}</div>
                  </div>
                </div>
              </div>
            )}

            {/* The question nobody answered */}
            {result.the_question_nobody_answered && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <HelpCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-red-700 mb-1.5">The question a confused user WILL ask (that nobody answered)</div>
                    <p className="text-sm font-medium text-red-900 mb-2">"{result.the_question_nobody_answered.question}"</p>
                    <div className="text-xs text-red-700 mb-2 italic">{result.the_question_nobody_answered.why_they_will_ask}</div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="text-[10px] font-semibold text-red-600 mb-0.5">Suggested answer to add to docs</div>
                      <p className="text-xs text-gray-700">{result.the_question_nobody_answered.suggested_answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 fixes */}
            {result.top_3_fixes_before_ship?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Rocket size={13} className="text-[#4F46E5]" /> Top 3 fixes before you ship
                </div>
                <div className="space-y-2">
                  {result.top_3_fixes_before_ship.map((fix, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{fix.priority}</div>
                      <span className="flex-1 text-xs text-gray-700">{fix.action}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${fix.effort === 'low' ? 'bg-emerald-50 text-emerald-700' : fix.effort === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{fix.effort} effort</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.contradictions?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <XCircle size={11} className="text-red-400" /> Contradictions ({result.contradictions.length})
                </div>
                <div className="space-y-2">
                  {result.contradictions.map((c, i) => <IssueCard key={i} item={c} type="contradiction" />)}
                </div>
              </div>
            )}

            {result.missing_steps?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={11} className="text-amber-400" /> Missing steps ({result.missing_steps.length})
                </div>
                <div className="space-y-2">
                  {result.missing_steps.map((m, i) => <IssueCard key={i} item={m} type="gap" />)}
                </div>
              </div>
            )}

            {result.positive_notes?.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle size={11} /> What's well done
                </div>
                <ul className="space-y-1">
                  {result.positive_notes.map((n, i) => <li key={i} className="text-xs text-emerald-800 flex items-start gap-1.5"><CheckCircle size={10} className="flex-shrink-0 mt-0.5 text-emerald-500" />{n}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

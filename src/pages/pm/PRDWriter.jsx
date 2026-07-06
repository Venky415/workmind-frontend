// pages/pm/PRDWriter.jsx
import { useState } from 'react';
import { FileText, Play, Loader, AlertTriangle, CheckCircle, Target, XCircle, HelpCircle, Layers, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const EXAMPLES = {
  problem: 'Engineers spend 2+ hours per week copying data between our app and spreadsheets for reporting. This causes errors, delays Monday standup, and frustrates our highest-value users.',
  user: "Senior engineers on Pro plan (teams of 5-15) who run weekly sprint reports. They are technical but don't want to write custom scripts.",
  constraint: 'Must ship in 6 weeks. No new backend infrastructure. Must work with existing data model. Mobile not in scope for v1.'
};

function Section({ icon: Icon, title, children, color = 'indigo' }) {
  const [open, setOpen] = useState(true);
  const colors = { indigo: 'text-[#4F46E5] bg-indigo-50', emerald: 'text-emerald-600 bg-emerald-50', red: 'text-red-500 bg-red-50', amber: 'text-amber-600 bg-amber-50' };
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button className="w-full flex items-center gap-2.5 p-4 hover:bg-gray-50 transition-colors" onClick={() => setOpen(o => !o)}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}><Icon size={13} /></div>
        <span className="text-sm font-semibold text-gray-900 flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-50">{children}</div>}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#4F46E5] transition-colors">
      {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function PRDWriter() {
  const [form, setForm] = useState({ problem: '', user: '', constraint: '', context: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const loadExample = () => setForm({ ...form, ...EXAMPLES });

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('https://workmind-backend-production.up.railway.app/api/pm/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const { prd, critique } = result || {};

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center"><FileText size={15} className="text-white" /></div>
            <h1 className="text-lg font-semibold text-gray-900">AI PRD Writer</h1>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#4F46E5] rounded-full border border-indigo-100 font-medium">Tool 3</span>
          </div>
          <p className="text-xs text-gray-500 ml-[42px]">3 inputs → full PRD draft with goals, metrics, edge cases. Then it argues against its own draft and flags the weakest assumption. Edit down, not up.</p>
        </div>

        {!result && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">3 inputs needed</span>
              <button onClick={loadExample} className="text-xs px-3 py-1.5 border border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-indigo-50">Load example</button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'problem', label: 'The Problem', placeholder: 'What user pain are you solving? Be specific — mention who, what, and how often.', rows: 3 },
                { key: 'user', label: 'The User', placeholder: 'Who exactly is this for? Segment, behavior, and what they care about.', rows: 2 },
                { key: 'constraint', label: 'The Constraint', placeholder: 'Timeline, technical limits, scope boundaries, budget, or team size.', rows: 2 },
                { key: 'context', label: 'Additional Context (optional)', placeholder: 'Competitive landscape, past attempts, related features...', rows: 2 },
              ].map(({ key, label, placeholder, rows }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                  <textarea value={form[key]} onChange={set(key)} placeholder={placeholder} rows={rows}
                    className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 placeholder-gray-300 outline-none focus:border-[#4F46E5] leading-relaxed" />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={run} disabled={loading || !form.problem || !form.user || !form.constraint}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-40 font-medium">
                {loading ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                {loading ? 'Writing PRD + self-critique...' : 'Generate PRD'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={24} className="animate-pulse text-[#4F46E5]" />
            <div className="text-sm text-gray-500">Writing PRD draft...</div>
            <div className="text-xs text-gray-400">Then arguing against it</div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 mb-4">⚠ {error}</div>}

        {prd && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">{prd.title}</div>
                <div className="text-xs text-gray-400">{prd.one_liner}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${prd.risk_level === 'high' ? 'bg-red-50 text-red-700 border-red-200' : prd.risk_level === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {prd.risk_level} risk
                </span>
                <button onClick={() => setResult(null)} className="text-xs text-[#4F46E5] hover:underline">← Rewrite</button>
              </div>
            </div>

            {/* Critique banner — most important */}
            {critique && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-red-700 mb-1">Weakest assumption (fix this before you ship)</div>
                    <p className="text-xs text-red-800 mb-2">{critique.weakest_assumption}</p>
                    {critique.why_it_could_fail && (
                      <p className="text-xs text-red-700 italic">Failure scenario: {critique.why_it_could_fail}</p>
                    )}
                    {critique.devil_advocate_question && (
                      <div className="mt-2 p-2.5 bg-red-100 rounded-lg">
                        <div className="text-[10px] font-semibold text-red-600 mb-0.5">Devil's advocate</div>
                        <p className="text-xs text-red-800">"{critique.devil_advocate_question}"</p>
                      </div>
                    )}
                    {critique.suggested_validation && (
                      <div className="mt-2 p-2.5 bg-white rounded-lg border border-red-100">
                        <div className="text-[10px] font-semibold text-red-600 mb-0.5">Validate before building</div>
                        <p className="text-xs text-red-800">{critique.suggested_validation}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-red-500">Confidence</div>
                    <div className="text-lg font-bold text-red-600">{critique.confidence_score}/10</div>
                  </div>
                </div>
              </div>
            )}

            <Section icon={Target} title="Goals" color="emerald">
              <ul className="mt-3 space-y-1.5">
                {prd.goals?.map((g, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700"><CheckCircle size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />{g}</li>)}
              </ul>
            </Section>

            <Section icon={XCircle} title="Non-goals" color="red">
              <ul className="mt-3 space-y-1.5">
                {prd.non_goals?.map((g, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700"><XCircle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />{g}</li>)}
              </ul>
            </Section>

            <Section icon={Layers} title="Success metrics" color="indigo">
              <div className="mt-3 space-y-2">
                {prd.success_metrics?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-800 flex-1">{m.metric}</span>
                    <span className="text-gray-400">{m.baseline} → <span className="text-emerald-600 font-medium">{m.target}</span></span>
                    <span className="text-gray-400 text-[10px]">{m.timeframe}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={AlertTriangle} title="Edge cases" color="amber">
              <ul className="mt-3 space-y-1.5">
                {prd.edge_cases?.map((e, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700"><AlertTriangle size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />{e}</li>)}
              </ul>
            </Section>

            <Section icon={HelpCircle} title="Open questions" color="indigo">
              <ul className="mt-3 space-y-1.5">
                {prd.open_questions?.map((q, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700"><HelpCircle size={11} className="text-[#4F46E5] flex-shrink-0 mt-0.5" />{q}</li>)}
              </ul>
            </Section>

            {critique?.missing_considerations?.length > 0 && (
              <Section icon={AlertTriangle} title="Missing considerations (from self-critique)" color="red">
                <ul className="mt-3 space-y-1.5">
                  {critique.missing_considerations.map((m, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700"><AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />{m}</li>)}
                </ul>
              </Section>
            )}

            <div className="flex justify-end">
              <CopyButton text={JSON.stringify(prd, null, 2)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

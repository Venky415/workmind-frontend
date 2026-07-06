// pages/Chat.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, Car, Ticket, Receipt, BookOpen, Zap, Brain } from 'lucide-react';
import { sendMessage } from '../services/api.js';
import ActionCard from '../components/ActionCard.jsx';
import MemoryPanel from '../components/MemoryPanel.jsx';

const QUICK_ACTIONS = [
  { label: 'Book a cab home', icon: Car, msg: 'Book a cab from office Whitefield to Koramangala today at 7 PM' },
  { label: 'Raise IT ticket', icon: Ticket, msg: 'Raise an IT ticket — my laptop screen is flickering and makes it hard to work' },
  { label: 'Claim expense', icon: Receipt, msg: 'Claim reimbursement of ₹340 for my cab ride yesterday from Happay' },
  { label: 'Check courses', icon: BookOpen, msg: 'What mandatory courses do I need to complete this quarter?' },
];

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: `Hey Rahul 👋 I'm WorkMind AI, your enterprise assistant. I'm connected to **ServiceNow, MoveInSync, Happay, Workday, LMS**, and your **IT Portal** — and I can take real actions for you.\n\nTell me what you need — book a cab, raise a ticket, file an expense, check your courses, or anything else.`,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  toolCalls: []
};

function renderText(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Zap size={12} className="text-[#4F46E5]" />
      </div>
      <div className="msg-bubble-ai flex items-center gap-1 px-4 py-3">
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
      </div>
    </div>
  );
}

function ToolCallStatus({ calls }) {
  if (!calls.length) return null;
  return (
    <div className="flex flex-col gap-1 mb-2">
      {calls.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] bg-indigo-50 rounded-lg px-2.5 py-1.5">
          <Zap size={11} className="animate-pulse" />
          {c.state === 'calling' ? `Calling ${c.tool.replace(/_/g, ' ')}…` : `✓ ${c.tool.replace(/_/g, ' ')} completed`}
        </div>
      ))}
    </div>
  );
}

export default function Chat({ onNewMessage }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveToolCalls, setLiveToolCalls] = useState([]);
  const [showMemory, setShowMemory] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), toolCalls: [] };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setLiveToolCalls([]);

    const apiMessages = [...messages.filter(m => m.id !== 'welcome'), userMsg].map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

    try {
      let finalText = '';
      const toolCallsForMsg = [];

      await sendMessage(apiMessages, (event) => {
        if (event.type === 'tool_call') {
          const entry = { tool: event.tool, state: 'calling', result: null };
          toolCallsForMsg.push(entry);
          setLiveToolCalls([...toolCallsForMsg]);
        }
        if (event.type === 'tool_result') {
          const existing = toolCallsForMsg.find(t => t.tool === event.tool && t.state === 'calling');
          if (existing) { existing.state = 'done'; existing.result = event.result; }
          setLiveToolCalls([...toolCallsForMsg]);
        }
        if (event.type === 'done') {
          finalText = event.text;
        }
      });

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: finalText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: toolCallsForMsg
      };
      setMessages(prev => [...prev, aiMsg]);
      onNewMessage?.({ userMsg, aiMsg });
    } catch (err) {
      const errMsg = { id: Date.now() + 1, role: 'assistant', text: `⚠️ Connection error: ${err.message}\n\nMake sure the backend is running on port 3001.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), toolCalls: [] };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setLiveToolCalls([]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <div>
            <div className="text-sm font-semibold text-gray-900">WorkMind Assistant</div>
            <div className="text-[11px] text-gray-400">Connected · 6 platforms live</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {['SN', 'MIS', 'HP', 'WD', 'LMS', 'VPN'].map(p => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium">{p}</span>
            ))}
          </div>
          <button
            onClick={() => setShowMemory(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-[#4F46E5] hover:bg-indigo-100 transition-colors"
          >
            <Brain size={12} /> Memory
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 messages-area">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-indigo-100 text-[#4F46E5]' : 'bg-gray-200 text-gray-600'}`}>
              {msg.role === 'assistant' ? <Zap size={12} /> : 'RK'}
            </div>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              {msg.role === 'assistant' && msg.toolCalls?.length > 0 && (
                <div className="flex flex-col gap-1 mb-2 w-full">
                  {msg.toolCalls.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] bg-indigo-50 rounded-lg px-2.5 py-1.5">
                      <Zap size={11} /> ✓ {c.tool.replace(/_/g, ' ')} completed
                    </div>
                  ))}
                </div>
              )}
              <div className={msg.role === 'assistant' ? 'msg-bubble-ai' : 'msg-bubble-user'}>
                <span dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
              </div>
              {msg.role === 'assistant' && msg.toolCalls?.map((c, i) =>
                c.result ? <ActionCard key={i} toolName={c.tool} result={c.result} /> : null
              )}
              <div className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col gap-2">
            {liveToolCalls.length > 0 && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Zap size={12} className="text-[#4F46E5]" />
                </div>
                <ToolCallStatus calls={liveToolCalls} />
              </div>
            )}
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-5 py-4 bg-white flex-shrink-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, msg }) => (
            <button key={label} onClick={() => handleSend(msg)} className="quick-chip">
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything — book a cab, raise a ticket, log hours…"
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#4F46E5] transition-colors leading-relaxed"
            style={{ minHeight: 42, maxHeight: 120, overflowY: 'auto' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40 hover:opacity-85"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-2 text-center">Actions affecting payroll, finance, or access are logged and auditable.</div>
      </div>

      {showMemory && <MemoryPanel onClose={() => setShowMemory(false)} />}
    </div>
  );
}

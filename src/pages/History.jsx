// pages/History.jsx
import { MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History({ sessions, onSelect, onDelete }) {
  const navigate = useNavigate();

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle size={32} className="text-gray-300 mb-3" />
        <div className="text-sm font-medium text-gray-500">No chat history yet</div>
        <div className="text-xs text-gray-400 mt-1">Your conversations will appear here</div>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg">
          Start a conversation
        </button>
      </div>
    );
  }

  const grouped = sessions.reduce((acc, s) => {
    const key = s.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Chat history</h2>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{date}</div>
            {items.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group mb-1 border border-transparent hover:border-gray-100"
                onClick={() => { onSelect(session); navigate('/'); }}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle size={11} className="text-[#4F46E5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">{session.title}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{session.time} · {session.msgCount} messages</div>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

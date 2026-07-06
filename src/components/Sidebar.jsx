// components/Sidebar.jsx
import { Brain, MessageCircle, History, LayoutDashboard, Ticket, Car, Receipt, Clock, BookOpen, Wifi, Settings, MessageSquare, Eye, FileText, Rocket, ChevronDown, ChevronRight, Bell } from 'lucide-react';
import WatchtowerWidget from './WatchtowerWidget.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';

const integrations = [
  { name: 'ServiceNow', icon: Ticket, status: 'ok' },
  { name: 'MoveInSync', icon: Car, status: 'ok' },
  { name: 'Happay', icon: Receipt, status: 'warn' },
  { name: 'Workday', icon: Clock, status: 'warn' },
  { name: 'LMS', icon: BookOpen, status: 'ok' },
  { name: 'VPN', icon: Wifi, status: 'ok' },
];

const pmTools = [
  { name: 'VoC Engine', icon: MessageSquare, path: '/pm/voc', label: '1' },
  { name: 'Competitor Radar', icon: Eye, path: '/pm/watchtower', label: '2' },
  { name: 'PRD Writer', icon: FileText, path: '/pm/prd', label: '3' },
  { name: 'Launch Auditor', icon: Rocket, path: '/pm/audit', label: '5' },
];

export default function Sidebar({ history }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const [pmOpen, setPmOpen] = useState(loc.pathname.startsWith('/pm'));

  const isPM = loc.pathname.startsWith('/pm');

  return (
    <aside className="w-[220px] bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center flex-shrink-0">
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">WorkMind AI</div>
            <div className="text-[10px] text-gray-400">Enterprise + PM Suite</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1.5">Workspace</div>
        {[
          { path: '/', icon: MessageCircle, label: 'Assistant' },
          { path: '/history', icon: History, label: 'History', badge: history.length > 0 ? history.length : null },
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ].map(({ path, icon: Icon, label, badge }) => (
          <div key={path}
            className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all',
              loc.pathname === path ? 'bg-white text-[#4F46E5] font-medium shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-white hover:text-gray-900')}
            onClick={() => navigate(path)}>
            <Icon size={14} />
            <span className="flex-1">{label}</span>
            {badge && <span className="text-[10px] bg-[#4F46E5] text-white rounded-full px-1.5 py-0.5">{badge}</span>}
          </div>
        ))}
      </div>

      {/* PM Tools */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setPmOpen(o => !o)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors">
          {pmOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          PM Tools
          <span className="ml-auto text-[10px] bg-indigo-100 text-[#4F46E5] rounded-full px-1.5 py-0.5 normal-case font-medium">4 tools</span>
        </button>
        {pmOpen && pmTools.map(({ path, icon: Icon, name, label }) => (
          <div key={path}
            className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all',
              loc.pathname === path ? 'bg-white text-[#4F46E5] font-medium shadow-sm border border-indigo-100' : 'text-gray-600 hover:bg-white hover:text-gray-900')}
            onClick={() => navigate(path)}>
            <Icon size={14} />
            <span className="flex-1 text-xs">{name}</span>
            <span className="text-[9px] w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold flex-shrink-0">{label}</span>
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div className="p-2 flex-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1.5">Integrations</div>
        {integrations.map(({ name, icon: Icon, status }) => (
          <div key={name} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white cursor-pointer transition-all">
            <Icon size={13} className="text-gray-400" />
            <span className="flex-1 text-xs">{name}</span>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'ok' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </div>
        ))}
      </div>

      {/* Watchtower Widget */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0">
        <WatchtowerWidget />
      </div>

      {/* User */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-semibold text-[#4F46E5] flex-shrink-0">RK</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">Rahul Kumar</div>
            <div className="text-[10px] text-gray-400 truncate">Engineer · PM Suite</div>
          </div>
          <Settings size={13} className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

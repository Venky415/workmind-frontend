// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import WatchtowerWidget from '../components/WatchtowerWidget.jsx';
import { Ticket, Receipt, Clock, BookOpen, Wifi, Car, Zap, TrendingUp } from 'lucide-react';
import { getDashboard } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

function MetricCard({ icon: Icon, label, value, sub, subColor }) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2"><Icon size={13} /> {label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {sub && <div className={`text-xs mt-1 ${subColor || 'text-gray-400'}`}>{sub}</div>}
    </div>
  );
}

function SpendBar({ label, amount, max, color }) {
  const pct = Math.round((amount / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">₹{amount.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">
      <Zap size={14} className="animate-spin mr-2" /> Loading dashboard…
    </div>
  );

  const { tickets, expenses, timesheet, courses, vpn } = data;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Wednesday, June 25, 2026 · Bangalore</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> All 6 platforms connected
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <MetricCard icon={Ticket} label="Open tickets" value={tickets.tickets?.filter(t => t.status !== 'Resolved').length || 1} sub="2 resolved this week" subColor="text-gray-400" />
          <MetricCard icon={Receipt} label="Pending claims" value={`₹${(expenses.totalPending || 2840).toLocaleString()}`} sub="↑ ₹340 added today" subColor="text-emerald-600" />
          <MetricCard icon={Clock} label="Timesheet" value={`${timesheet.logged}/${timesheet.totalRequired}h`} sub="Friday missing" subColor="text-red-500" />
          <MetricCard icon={BookOpen} label="Courses due" value={courses.dueThisQuarter - courses.completed} sub={`Deadline Jun 30`} subColor="text-amber-600" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Activity Feed */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Zap size={14} className="text-[#4F46E5]" /> Recent AI actions</div>
              <button onClick={() => navigate('/')} className="text-xs text-[#4F46E5] hover:underline">Go to chat ↗</button>
            </div>
            {[
              { icon: Car, color: 'bg-teal-50 text-teal-700', title: 'Cab booked — Whitefield → Electronic City', desc: 'Toyota Etios · Tomorrow 9:00 AM', time: 'Today 2:41 PM · MoveInSync', badge: 'Confirmed', badgeColor: 'bg-emerald-50 text-emerald-700' },
              { icon: Receipt, color: 'bg-amber-50 text-amber-700', title: 'Reimbursement submitted — ₹340', desc: 'Local conveyance · Awaiting Neha Sharma', time: 'Today 2:41 PM · Happay', badge: 'Pending', badgeColor: 'bg-amber-50 text-amber-700' },
              { icon: Ticket, color: 'bg-indigo-50 text-[#4F46E5]', title: 'Ticket INC00247831 raised', desc: 'Laptop screen flickering · P2 · IT visit tomorrow', time: 'Today 11:14 AM · ServiceNow', badge: 'In progress', badgeColor: 'bg-blue-50 text-blue-700' },
              { icon: Clock, color: 'bg-blue-50 text-blue-700', title: 'Timesheet prefilled — 32 hrs', desc: 'INFRA-2024-Q2 · Mon–Thu auto-filled', time: 'Today 9:02 AM · Workday', badge: 'Fri missing', badgeColor: 'bg-amber-50 text-amber-700' },
              { icon: Wifi, color: 'bg-rose-50 text-rose-600', title: 'VPN certificate renewed', desc: 'Bangalore cluster · 90 days', time: 'Yesterday 6:30 PM · IT Portal', badge: 'Done', badgeColor: 'bg-emerald-50 text-emerald-700' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}><Icon size={13} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900">{item.title}</div>
                    <div className="text-[11px] text-gray-400 truncate">{item.desc}</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">{item.time}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${item.badgeColor}`}>{item.badge}</span>
                </div>
              );
            })}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Platform Health */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex-1">
              <div className="text-sm font-medium text-gray-900 mb-3">Platform health</div>
              {[
                { name: 'ServiceNow', stat: `${tickets.tickets?.length || 3} tickets`, ok: true },
                { name: 'MoveInSync', stat: '1 ride upcoming', ok: true },
                { name: 'Happay', stat: `₹${(expenses.totalPending || 2840).toLocaleString()} pending`, ok: false },
                { name: 'Workday', stat: `${timesheet.logged}/${timesheet.totalRequired} hrs`, ok: false },
                { name: 'LMS', stat: `${courses.completed}/${courses.dueThisQuarter} done`, ok: true },
                { name: 'VPN', stat: `${vpn.certValidDays} days valid`, ok: true },
              ].map(({ name, stat, ok }) => (
                <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div>
                      <div className="text-xs font-medium text-gray-800">{name}</div>
                      <div className="text-[10px] text-gray-400">{stat}</div>
                    </div>
                  </div>
                  <span className={ok ? 'platform-badge-ok' : 'platform-badge-warn'}>{ok ? 'Live' : 'Needs action'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Watchtower + Spend row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-1">
          <WatchtowerWidget />
        </div>
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">Quick insight</div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            The Watchtower runs daily at 9am and notifies you only when a competitor changes their pricing or ships a new feature — so you never miss a competitive move while staying focused on building.
          </p>
          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline font-medium">
            Open full Watchtower →
          </a>
        </div>
      </div>

      {/* Spend + AI stats row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><TrendingUp size={14} className="text-[#4F46E5]" /> Monthly spend</div>
              <div className="text-xs text-gray-400">June · ₹12,000 limit</div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-semibold text-gray-900">₹8,420</span>
              <span className="text-xs text-gray-400">spent · ₹3,580 remaining</span>
            </div>
            <SpendBar label="Cab rides" amount={3200} max={12000} color="#4F46E5" />
            <SpendBar label="Meals" amount={2600} max={12000} color="#1D9E75" />
            <SpendBar label="Accommodation" amount={1800} max={12000} color="#EF9F27" />
            <SpendBar label="Miscellaneous" amount={820} max={12000} color="#B4B2A9" />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-1.5"><Zap size={14} className="text-[#4F46E5]" /> AI actions this month</div>
            <div className="text-[11px] text-gray-400 mb-4">75 total · ~4.2 hrs saved</div>
            {[
              { name: 'MoveInSync', count: 22, color: '#1D9E75' },
              { name: 'Happay', count: 18, color: '#EF9F27' },
              { name: 'ServiceNow', count: 14, color: '#4F46E5' },
              { name: 'Workday', count: 9, color: '#378ADD' },
              { name: 'IT Portal', count: 7, color: '#D85A30' },
              { name: 'LMS', count: 5, color: '#639922' },
            ].map(({ name, count, color }) => (
              <div key={name} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{name}</span>
                  <span className="font-medium text-gray-800">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((count / 22) * 100)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestion banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0"><Zap size={15} className="text-white" /></div>
            <div>
              <div className="text-sm font-medium text-gray-900">You have 2 courses due in 5 days and Friday timesheet missing</div>
              <div className="text-xs text-gray-500 mt-0.5">I can handle both right now — submit timesheet and open your courses in sequence.</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="flex-shrink-0 ml-4 px-4 py-2 bg-[#4F46E5] text-white text-xs rounded-lg hover:opacity-90 transition-opacity font-medium">
            Yes, do it for me ↗
          </button>
        </div>
      </div>
    </div>
  );
}

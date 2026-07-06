// components/ActionCard.jsx
import { CheckCircle, Circle, Loader, Car, Ticket, Receipt, Clock, BookOpen, Wifi } from 'lucide-react';

const iconMap = { raise_ticket: Ticket, book_cab: Car, create_expense: Receipt, submit_timesheet: Clock, get_courses: BookOpen, renew_vpn: Wifi, get_timesheet: Clock, get_expenses: Receipt, get_tickets: Ticket, get_vpn_status: Wifi };

function Step({ label, state }) {
  return (
    <div className={`flex items-start gap-2 text-xs ${state === 'done' ? 'text-emerald-600' : state === 'active' ? 'text-[#4F46E5]' : 'text-gray-400'}`}>
      <span className="mt-0.5 flex-shrink-0">
        {state === 'done' ? <CheckCircle size={13} /> : state === 'active' ? <Loader size={13} className="animate-spin" /> : <Circle size={13} />}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 mb-0.5">{label}</div>
      <div className="text-xs font-medium text-gray-800">{value}</div>
    </div>
  );
}

export default function ActionCard({ toolName, result }) {
  const Icon = iconMap[toolName] || Ticket;

  if (toolName === 'book_cab' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Cab booked via MoveInSync
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Pickup" value={result.pickup} />
          <Field label="Drop" value={result.drop} />
          <Field label="Time" value={result.datetime} />
          <Field label="Est. fare" value={`₹${result.estimatedFare}`} />
          <Field label="Driver" value={result.driver?.name} />
          <Field label="Vehicle" value={`${result.driver?.vehicle} · ${result.driver?.plate}`} />
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          <Step label="Cab request sent to MoveInSync" state="done" />
          <Step label={`Driver assigned — ${result.driver?.name}`} state="done" />
          <Step label="Happay reimbursement draft created" state="active" />
          <Step label="Manager approval queued" state="pending" />
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-500">Trip ID: {result.tripId}</div>
      </div>
    );
  }

  if (toolName === 'raise_ticket' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Ticket raised in ServiceNow
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Ticket ID" value={result.ticketId} />
          <Field label="Priority" value={result.priority} />
          <Field label="Category" value={result.category} />
          <Field label="Assigned to" value={result.assignedTo} />
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          <Step label={`Ticket ${result.ticketId} raised`} state="done" />
          <Step label={`Classified as ${result.category} · ${result.priority}`} state="done" />
          <Step label="IT team notified via Slack & email" state="active" />
          <Step label={`Engineer visit: ${result.estimatedResolution}`} state="pending" />
        </div>
      </div>
    );
  }

  if (toolName === 'create_expense' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Expense filed in Happay
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Amount" value={`₹${result.amount}`} />
          <Field label="Category" value={result.category} />
          <Field label="Expense ID" value={result.expenseId} />
          <Field label="Submitted to" value={result.submittedTo} />
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          <Step label="Expense entry created in Happay" state="done" />
          <Step label="Receipt auto-attached" state="done" />
          <Step label={`Submitted to ${result.submittedTo}`} state="active" />
          <Step label={`Credit expected: ${result.expectedCredit}`} state="pending" />
        </div>
      </div>
    );
  }

  if (toolName === 'get_timesheet' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Timesheet — {result.week}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Project" value={result.project} />
          <Field label="Logged" value={`${result.logged}/${result.totalRequired} hrs`} />
        </div>
        <div className="space-y-1">
          {result.days?.map(d => (
            <div key={d.day} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{d.day}</span>
              <span className={d.status === 'logged' ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                {d.status === 'logged' ? `${d.hours}h ✓` : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === 'submit_timesheet' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Timesheet submitted
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Total hours" value={`${result.totalHours} hrs`} />
          <Field label="Submitted to" value={result.submittedTo} />
          <Field label="Project" value={result.projectCode} />
          <Field label="Status" value={result.status} />
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          <Step label="Timesheet entries saved" state="done" />
          <Step label={`Submitted to ${result.submittedTo} for review`} state="done" />
          <Step label="Manager approval pending" state="active" />
        </div>
      </div>
    );
  }

  if (toolName === 'get_courses' && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Learning — {result.completed}/{result.dueThisQuarter} completed this quarter
        </div>
        <div className="space-y-2">
          {result.courses?.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-gray-800">{c.title}</div>
                <div className="text-[10px] text-gray-400">{c.duration} · {c.platform}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {c.status === 'Completed' ? '✓ Done' : c.deadline}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((toolName === 'get_vpn_status' || toolName === 'renew_vpn') && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> VPN Status
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Status" value={result.status} />
          <Field label="Cluster" value={result.cluster || 'Bangalore-1'} />
          <Field label="Cert valid" value={`${result.certValidDays} days`} />
          {result.ipAssigned && <Field label="IP" value={result.ipAssigned} />}
        </div>
      </div>
    );
  }

  if ((toolName === 'get_tickets') && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Your IT Tickets
        </div>
        <div className="space-y-2">
          {result.tickets?.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-gray-800">{t.title}</div>
                <div className="text-[10px] text-gray-400">{t.id} · {t.priority} · {t.updated}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((toolName === 'get_expenses') && result.success) {
    return (
      <div className="action-card">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-3">
          <Icon size={13} className="text-[#4F46E5]" /> Your Expenses · Total pending: ₹{result.totalPending}
        </div>
        <div className="space-y-2">
          {result.expenses?.map(e => (
            <div key={e.id} className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-gray-800">{e.category}</span>
                <span className="text-gray-400 ml-1">· {e.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{e.amount}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{e.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

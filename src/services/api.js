const BASE = 'https://workmind-backend-c2ls.onrender.com/api';

export const userContext = {
  name: 'Rahul Kumar', employeeId: 'EMP-10042',
  department: 'Engineering', managerName: 'Neha Sharma',
  managerId: 'MGR-2001', projectCode: 'INFRA-2024-Q2',
  location: 'Bangalore'
};

export async function sendMessage(messages, onEvent) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userContext })
  });
  if (!res.ok) throw new Error('Failed to connect to WorkMind backend');
  const data = await res.json();
  if (data.toolCalls) {
    for (const chunk of data.toolCalls) {
      onEvent({ type: 'chunk', ...chunk });
    }
  }
  onEvent({ type: 'done', text: data.text || data.error || 'No response' });
}

export async function runVOC(feedbackText, useDemo = false) {
  const res = await fetch(`${BASE}/pm/voc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedbackText, useDemo, source: 'mixed', dateRange: '90 days' })
  });
  return res.json();
}

export async function runPRD(problem, user, constraint, context = '') {
  const res = await fetch(`${BASE}/pm/prd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, user, constraint, context })
  });
  return res.json();
}

export async function runAudit(documents, featureName = '', useDemo = false) {
  const res = await fetch(`${BASE}/pm/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, featureName, useDemo })
  });
  return res.json();
}

export async function getDashboard() {
  const res = await fetch(`${BASE}/platforms/dashboard`);
  return res.json();
}
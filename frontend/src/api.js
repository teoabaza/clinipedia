const BASE = import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.reload()
    return
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  // Auth
  login: (username, password) =>
    fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()),

  verify: () => request('GET', '/auth/verify'),

  // Nodes
  getChildren: (parentId) =>
    request('GET', `/nodes${parentId ? `?parent_id=${parentId}` : ''}`),

  getNode: (id) => request('GET', `/nodes/${id}`),

  getBreadcrumb: (id) => request('GET', `/nodes/${id}/breadcrumb`),

  createNode: (data) => request('POST', '/nodes', data),

  updateNode: (id, data) => request('PATCH', `/nodes/${id}`, data),

  deleteNode: (id) => request('DELETE', `/nodes/${id}`),
}

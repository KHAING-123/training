// 相対パスにすることで、ブラウザは常に「今アクセスしている画面と同じオリジン」にリクエストする。
// 実際のバックエンドへの転送は vite.config.js の server.proxy が行う。
const BASE_URL = '/api/tasks';

// レスポンスを共通処理する
// バックエンドは常に { error: { message } } 形式でエラーを返す設計なので、
// ここで揃えて Error として投げ直し、呼び出し側は catch するだけでよくする
async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message ?? `リクエストに失敗しました (status: ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

// GET /api/tasks
export async function fetchTasks() {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
}

// POST /api/tasks
export async function createTask(title) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
}

// PUT /api/tasks/:id
export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

// DELETE /api/tasks/:id
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

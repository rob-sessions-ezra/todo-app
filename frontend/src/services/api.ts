import type { TaskItem, TaskListModel, CreateTask, CreateTaskList, ReorderTasks, AuthResponse, PriorityLevel } from '../types/api';

const API_BASE = 'http://localhost:5237/api';

// Token helpers
const TOKEN_KEY = 'auth.token';
const EMAIL_KEY = 'auth.email';

export const auth = {
    get token() {
        return localStorage.getItem(TOKEN_KEY) ?? '';
    },
    get email() {
        return localStorage.getItem(EMAIL_KEY) ?? '';
    },
    set(token: string, email: string) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
    }    
};

// Helper to include auth token and handle errors
async function fetchWithCreds(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const t = auth.token;
  if (t) {
    headers.set('Authorization', `Bearer ${t}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { credentials: 'include', ...init, headers });

  if (!res.ok) {
    // try to surface a useful message
    let msg = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const j = await res.json();
        msg = j?.message ?? j?.error ?? msg;
      } else {
        msg = (await res.text()) || msg;
      }
    } catch { /* ignore */ }

    // Throw on fetch failures - triggers onError in useQuery
    throw new Error(msg);
  }

  return res;
}

export const api = {

    // Auth endpoints
    async register(email: string, password: string): Promise<AuthResponse> {
        const res = await fetchWithCreds(`${API_BASE}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        auth.set(data.token, data.email);
        return data;
    },
    async login(email: string, password: string): Promise<AuthResponse> {
        const res = await fetchWithCreds(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        auth.set(data.token, data.email);
        return data;
    },
    async logout(): Promise<void> {
        try {
            await fetchWithCreds(`${API_BASE}/auth/logout`, { method: 'POST' });
        } finally {
            auth.clear();
        }
    },

    // Lists
    async getLists(): Promise<TaskListModel[]> {
        const res = await fetchWithCreds(`${API_BASE}/lists`);
        return res.json();
    },
    async createList(list: CreateTaskList): Promise<TaskListModel> {
        const res = await fetchWithCreds(`${API_BASE}/lists`, {
            method: 'POST',
            body: JSON.stringify(list)
        });
        return res.json();
    },
    async updateListTitle(id: number, name: string): Promise<void> {
        await fetchWithCreds(`${API_BASE}/lists/${id}/title`, {
            method: 'PATCH',
            body: JSON.stringify({ name })
        });
    },
    async reorderTasks(listId: number, taskIds: number[]): Promise<void> {
        await fetchWithCreds(`${API_BASE}/lists/${listId}/reorder-tasks`, {
            method: 'PUT',
            body: JSON.stringify({ taskIds } satisfies ReorderTasks)
        });
    },
    async deleteList(id: number): Promise<void> {
        await fetchWithCreds(`${API_BASE}/lists/${id}`, { method: 'DELETE' });
    },

    // Tasks
    async getTasks(listId?: number): Promise<TaskItem[]> {
        const url = `${API_BASE}/tasks${listId ? `?listId=${listId}` : ''}`;
        const res = await fetchWithCreds(url);
        return res.json();
    },
    async createTask(task: CreateTask): Promise<TaskItem> {
        const res = await fetchWithCreds(`${API_BASE}/tasks`, {
            method: 'POST',
            body: JSON.stringify(task)
        });
        return res.json();
    },
    async updateTaskTitle(id: number, title: string): Promise<void> {
        await fetchWithCreds(`${API_BASE}/tasks/${id}/title`, {
            method: 'PATCH',
            body: JSON.stringify({ title })
        });
    },
    async setTaskComplete(id: number, isComplete: boolean): Promise<void> {
        await fetchWithCreds(`${API_BASE}/tasks/${id}/complete`, {
            method: 'PATCH',
            body: JSON.stringify({ isComplete })
        });
    },
    async setTaskPriority(id: number, priority: PriorityLevel): Promise<void> {
        await fetchWithCreds(`${API_BASE}/tasks/${id}/priority`, {
            method: 'PATCH',
            body: JSON.stringify({ priority })
        });
    },
    async deleteTask(id: number): Promise<void> {
        await fetchWithCreds(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    }
};

import type { TaskItem, TaskList, CreateTask, CreateTaskList, ReorderTasks, AuthResponse } from '../types/api';

const API_BASE = 'http://localhost:5237/api';

// Token helpers
const TOKEN_KEY = 'auth.token';
const EMAIL_KEY = 'auth.email';

export const auth = {
    get token() {
        return localStorage.getItem(TOKEN_KEY) ?? '';
    },
    set(token: string, email: string) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
    },
    get email() {
        return localStorage.getItem(EMAIL_KEY) ?? '';
    }
};

function withAuth(headers: HeadersInit = {}): HeadersInit {
    const t = auth.token;
    return t ? { 
        ...headers, 
        Authorization: `Bearer ${t}`
    } : headers;
}

// Include credentials (cookies) on all requests
function withCreds(init?: RequestInit): RequestInit {
    const base = init ?? {};
    const mergedHeaders = withAuth((base.headers ?? {}) as HeadersInit);
    return {
        ...base,
        credentials: 'include',
        headers: mergedHeaders,
    };
}

export const api = {
    // Auth endpoints
    async register(email: string, password: string): Promise<AuthResponse> {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { 
            throw new Error(data?.message ?? 'Register failed');
        }
        auth.set(data.token, data.email);
        return data;
    },
    async login(email: string, password: string): Promise<AuthResponse> {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message ?? 'Login failed');
        }
        auth.set(data.token, data.email);
        return data;
    },
    async logout(): Promise<void> {
        try {
            await fetch(`${API_BASE}/auth/logout`, withCreds({ method: 'POST' }));
        } finally {
            auth.clear();
        }
    },

    // Lists
    async getLists(): Promise<TaskList[]> {
        const res = await fetch(`${API_BASE}/lists`, withCreds());
        return res.json();
    },
    async createList(list: CreateTaskList): Promise<TaskList> {
        const res = await fetch(`${API_BASE}/lists`, withCreds({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list)
        }));
        return res.json();
    },
    async updateListTitle(id: number, name: string): Promise<void> {
        await fetch(`${API_BASE}/lists/${id}/title`, withCreds({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        }));
    },
    async reorderTasks(listId: number, taskIds: number[]): Promise<void> {
        await fetch(`${API_BASE}/lists/${listId}/reorder-tasks`, withCreds({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskIds } satisfies ReorderTasks)
        }));
    },
    async deleteList(id: number): Promise<void> {
        await fetch(`${API_BASE}/lists/${id}`, withCreds({ method: 'DELETE' }));
    },

    // Tasks
    async getTasks(listId?: number): Promise<TaskItem[]> {
        const url = `${API_BASE}/tasks${listId ? `?listId=${listId}` : ''}`;
        const res = await fetch(url, withCreds());
        return res.json();
    },
    async createTask(task: CreateTask): Promise<TaskItem> {
        const res = await fetch(`${API_BASE}/tasks`, withCreds({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        }));
        return res.json();
    },
    async updateTask(id: number, task: CreateTask): Promise<void> {
        await fetch(`${API_BASE}/tasks/${id}`, withCreds({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        }));
    },
    async deleteTask(id: number): Promise<void> {
        await fetch(`${API_BASE}/tasks/${id}`, withCreds({ method: 'DELETE' }));
    }
};

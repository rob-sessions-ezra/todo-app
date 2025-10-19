import type { TaskItem, TaskList, CreateTask, CreateTaskList } from '../types/api';

const API_BASE = 'http://localhost:5237/api';

export const api = {
    async getLists(): Promise<TaskList[]> {
        const res = await fetch(`${API_BASE}/lists`);
        return res.json();
    },

    async createList(list: CreateTaskList): Promise<TaskList> {
        const res = await fetch(`${API_BASE}/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list)
        });
        return res.json();
    },
    
    async updateListTitle(id: number, name: string): Promise<void> {
        await fetch(`${API_BASE}/lists/${id}/title`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
    },

    async getTasks(listId?: number): Promise<TaskItem[]> {
        const url = `${API_BASE}/tasks${listId ? `?listId=${listId}` : ''}`;
        const res = await fetch(url);
        return res.json();
    },

    async createTask(task: CreateTask): Promise<TaskItem> {
        const res = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        return res.json();
    },

    async updateTask(id: number, task: CreateTask): Promise<void> {
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
    },

    async deleteTask(id: number): Promise<void> {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    }
};

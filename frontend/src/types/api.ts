export enum PriorityLevel {
    Normal = 'normal',
    Fire = 'fire'
}

export interface TaskItem {
    id: number;
    title: string;
    isComplete: boolean;
    priority: PriorityLevel;
    taskListId: number | null;
    order: number;
}

export interface TaskListModel {
    id: number;
    name: string;
    taskItems: TaskItem[];
}

export interface CreateTask {
    title: string;
    taskListId?: number | null;
}

export interface CreateTaskList {
    name: string;
}

export interface ReorderTasks {
    taskIds: number[];
}

export interface AuthResponse {
    userId: string;
    email: string;
    token: string;
}

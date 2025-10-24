export interface TaskItem {
    id: number;
    title: string;
    isComplete: boolean;
    dueDate: string | null;
    taskListId: number | null;
    order: number;
}

export interface TaskList {
    id: number;
    name: string;
    taskItems: TaskItem[];
}

export interface CreateTask {
    title: string;
    isComplete?: boolean;
    dueDate?: string | null;
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

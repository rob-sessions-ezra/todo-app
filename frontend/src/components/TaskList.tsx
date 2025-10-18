import { useState, useEffect } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';

export function TaskList({ list }: { list: TaskList }) {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        api.getTasks(list.id).then(setTasks);
    }, [list.id]);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            return;
        }

        const task = await api.createTask({
            title: newTaskTitle,
            taskListId: list.id
        });
        setTasks([...tasks, task]);
        setNewTaskTitle('');
    };

    const toggleTask = async (task: TaskItem) => {
        await api.updateTask(task.id, {
            ...task,
            isComplete: !task.isComplete
        });        
        setTasks(tasks.map(t => 
            t.id === task.id 
                ? { ...t, isComplete: !t.isComplete }
                : t
        ));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{list.name}</h2>
            </div>
            <div className="p-4">
                <form onSubmit={addTask} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="Add a task..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button type="submit">Add</Button>
                </form>
                <ul className="space-y-2">
                    {tasks.map(task => (
                        <li key={task.id} 
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                            <input
                                type="checkbox"
                                checked={task.isComplete}
                                onChange={() => toggleTask(task)}
                                className="h-4 w-4 text-indigo-600 rounded 
                                         focus:ring-indigo-500 border-gray-300"
                            />
                            <span className={`flex-1 ${task.isComplete ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {task.title}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';
import { TaskItemRow } from './TaskItemRow';

export function TaskList({ list }: { list: TaskList }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Load tasks once per list
  useEffect(() => {
    api.getTasks(list.id).then(setTasks);
  }, [list.id]);

  // Add new task
  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) {
        return;
    }

    setNewTaskTitle('');
    const created = await api.createTask({ title, taskListId: list.id });
    setTasks(prev => [...prev, created]);
  };

  // Toggle complete
  const onToggle = async (task: TaskItem) => {
    const next = !task.isComplete;
    await api.updateTask(task.id, { ...task, isComplete: next });
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, isComplete: next } : t)));
  };

  // Rename task
  const onRename = async (id: number, title: string) => {
    const existing = tasks.find(t => t.id === id);
    if (!existing || existing.title === title) {
        return;
    }

    await api.updateTask(id, { ...existing, title });
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));
  };

  const completedTasks = tasks.filter(t => t.isComplete);
  const incompleteTasks = tasks.filter(t => !t.isComplete);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{list.name}</h2>
      </div>

      <div className="p-4">
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <label htmlFor="newTask" className="sr-only">Add a task</label>
          <input
            id="newTask"
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="submit" disabled={!newTaskTitle.trim()}>Add</Button>
        </form>

        <ul className="space-y-2 mb-6">
          {incompleteTasks.map(t => (
            <TaskItemRow key={t.id} task={t} onToggle={onToggle} onRename={onRename} />
          ))}
        </ul>

        {completedTasks.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setIsExpanded(v => !v)}
              className="flex items-center gap-2 text-sm text-gray-500 mb-2 hover:text-gray-700"
            >
              <svg
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span>{completedTasks.length} Completed {completedTasks.length === 1 ? 'item' : 'items'}</span>
            </button>

            {isExpanded && (
              <ul className="space-y-2">
                {completedTasks.map(t => (
                  <TaskItemRow key={t.id} task={t} onToggle={onToggle} onRename={onRename} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

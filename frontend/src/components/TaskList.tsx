import { useEffect, useState } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';

export function TaskList({ list }: { list: TaskList }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load tasks once per list
  useEffect(() => {
    api.getTasks(list.id).then(setTasks);
  }, [list.id]);

  // Add
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
  const toggleTask = async (task: TaskItem) => {
    const next = !task.isComplete;
    await api.updateTask(task.id, { ...task, isComplete: next });
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, isComplete: next } : t)));
  };

  // Edit helpers
  const startEditing = (t: TaskItem) => {
    setEditingTaskId(t.id);
    setEditingText(t.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const saveEdit = async (taskId: number) => {
    const title = editingText.trim();
    if (!title) {
        return cancelEditing();
    }

    const existing = tasks.find(t => t.id === taskId);
    if (!existing || existing.title === title) {
        return cancelEditing();
    }

    await api.updateTask(taskId, { ...existing, title });
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, title } : t)));
    cancelEditing();
  };

  const completedTasks = tasks.filter(t => t.isComplete);
  const incompleteTasks = tasks.filter(t => !t.isComplete);

  const renderTask = (task: TaskItem) => {
    const isEditing = editingTaskId === task.id;
    const checkboxId = `task-${task.id}`;

    return (
      <li key={task.id} className="p-2 hover:bg-gray-50 rounded-md">
        <div className="flex items-center gap-3">
          <input
            id={checkboxId}
            name={checkboxId}
            type="checkbox"
            checked={task.isComplete}
            onChange={() => toggleTask(task)}
            aria-label={`Mark "${task.title}" as ${task.isComplete ? 'incomplete' : 'complete'}`}
            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
          />
          {isEditing ? (
            <input
              type="text"
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit(task.id);
                if (e.key === 'Escape') cancelEditing();
              }}
              onBlur={() => saveEdit(task.id)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <span
              onClick={() => startEditing(task)}
              className={`flex-1 cursor-text ${task.isComplete ? 'text-gray-400 line-through' : 'text-gray-700'}`}
              title="Click to edit"
            >
              {task.title}
            </span>
          )}
        </div>
      </li>
    );
  };

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
          {incompleteTasks.map(renderTask)}
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
                {completedTasks.map(renderTask)}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

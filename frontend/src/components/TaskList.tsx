import { useEffect, useState } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';
import { TaskItemRow } from './TaskItemRow';

export function TaskList({
  list,
  onDeleteList,
}: {
  list: TaskList;
  onDeleteList: (id: number) => void;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingList, setIsEditingList] = useState(false);
  const [listName, setListName] = useState(list.name);

  // Load tasks once per list
  useEffect(() => {
    api.getTasks(list.id).then(setTasks);
  }, [list.id]);

  useEffect(() => {
    setListName(list.name);
  }, [list.name]);

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

  // Delete task
  const onDeleteTask = async (id: number) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Rename list
  const startEditList = () => {
    setIsEditingList(true);
    setListName(list.name);
  };

  const cancelEditList = () => {
    setIsEditingList(false);
    setListName(list.name);
  };

  const saveListTitle = async () => {
    const next = listName.trim();

    if (!next) {
      return cancelEditList();
    }

    if (next === list.name) {
      return cancelEditList();
    }

    await api.updateListTitle(list.id, next);
    setIsEditingList(false);
  };

  // Delete list
  const deleteThisList = async () => {
    if (!confirm('Delete this list and all its tasks?')) {
      return;
    }

    await api.deleteList(list.id);
    onDeleteList(list.id);
  };

  const completedTasks = tasks.filter(t => t.isComplete);
  const incompleteTasks = tasks.filter(t => !t.isComplete);

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 relative transition hover:shadow-md flex flex-col">
      <div className="p-4 border-b border-gray-200">
        {isEditingList ? (
          <input
            className="text-lg font-semibold text-gray-900 bg-white px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={listName}
            onChange={e => setListName(e.target.value)}
            autoFocus
            onBlur={saveListTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                return saveListTitle();
              }

              if (e.key === 'Escape') {
                return cancelEditList();
              }
            }}
          />
        ) : (
          <h2
            className="text-lg font-semibold text-gray-900 cursor-text"
            onClick={startEditList}
            title="Click to rename"
          >
            {listName}
          </h2>
        )}
      </div>

      <div className="p-4 flex-1">
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
            <TaskItemRow
              key={t.id}
              task={t}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDeleteTask}
            />
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
              <span>
                {completedTasks.length} Completed{' '}
                {completedTasks.length === 1 ? 'item' : 'items'}
              </span>
            </button>

            {isExpanded && (
              <ul className="space-y-2">
                {completedTasks.map(t => (
                  <TaskItemRow
                    key={t.id}
                    task={t}
                    onToggle={onToggle}
                    onRename={onRename}
                    onDelete={onDeleteTask}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity border-t border-gray-200 px-3 py-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={deleteThisList}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
          title="Delete list"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

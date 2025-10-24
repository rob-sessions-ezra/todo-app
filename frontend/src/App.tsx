import { useState } from 'react';
import type { TaskList as TaskListType } from './types/api';
import { api } from './services/api';
import { TaskList } from './components/TaskList';
import { Button } from './components/Button';
import { AuthBar } from './components/AuthBar';
import { ThemeToggle } from './components/ThemeToggle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function App() {
  const [newListName, setNewListName] = useState('');
  const queryClient = useQueryClient();

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  const pushToast = (text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => dismissToast(id), 3000);
  };

  // Lists query
  const { data: lists = [] } = useQuery<TaskListType[]>({
    queryKey: ['lists'],
    queryFn: api.getLists,
  });

  // Create list (invalidate on success)
  const createList = useMutation({
    mutationFn: api.createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) {
      return;
    }
    setNewListName('');
    createList.mutate({ name });
    pushToast('List created successfully');
  };

  // When a list is deleted, update cache and drop its tasks cache
  const handleDeleteList = (id: number) => {
    queryClient.setQueryData<TaskListType[]>(['lists'], (prev) => {
      if (!prev) {
        return prev;
      }
      return prev.filter(l => l.id !== id);
    });
    queryClient.removeQueries({ queryKey: ['tasks', id] });
    pushToast('List deleted successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Tasks</h1>
            <AuthBar />
          </div>

          <form id="new-list-form" onSubmit={addList} className="flex gap-3 mb-8">
            <input
              id="new-list-name"
              name="listName"
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="Add a new list..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm
                         bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                         placeholder:text-gray-400 dark:placeholder:text-slate-400
                         focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Button type="submit" disabled={!newListName.trim()}>
              Create List
            </Button>
          </form>

          <div className="grid gap-6 md:grid-cols-2">
            {lists.map(list => (
              <TaskList
                key={list.id}
                list={list}
                onDeleteList={handleDeleteList}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed bottom-4 left-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className="rounded-md bg-gray-900 text-white dark:bg-slate-800 dark:text-slate-100 shadow-lg px-4 py-2 flex items-center gap-3"
          >
            <span className="text-sm">{t.text}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-auto text-xs opacity-70 hover:opacity-100"
              aria-label="Dismiss"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

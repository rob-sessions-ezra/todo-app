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
  const [toasts, setToasts] = useState<{ id: number; text: string; type?: 'success' | 'error' | 'info' }[]>([]);
  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  const pushToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => dismissToast(id), 3000);
  };
  const getErrMessage = (err: unknown) =>
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Something went wrong';

  // Lists query
  const { data: lists = [] } = useQuery<TaskListType[]>({
    queryKey: ['lists'],
    queryFn: api.getLists,
    onError: (e) => pushToast(getErrMessage(e), 'error'),
  });

  // Create list (invalidate on success)
  const createList = useMutation({
    mutationFn: api.createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setNewListName('');
      pushToast('List created successfully', 'success');
    },
    onError: (e) => {
      pushToast(getErrMessage(e), 'error');
    },
  });

  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) {
      return;
    }
    createList.mutate({ name });
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
    pushToast('List deleted successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Title, Auth, and Theme Selector */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Tasks</h1>
            <AuthBar />
          </div>

          {/* Create List Form */}
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

          {/* Task Lists */}
          <div className="grid gap-6 md:grid-cols-2">
            {lists.map(list => (
              <TaskList
                key={list.id}
                list={list}
                onDeleteList={handleDeleteList}
                onError={(msg) => pushToast(msg, 'error')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed bottom-4 left-4 z-50 space-y-3">
        {toasts.map(t => (
          <div
            key={t.id}
            role="alert"
            className={[
              'rounded-lg px-5 py-3 flex items-start gap-3 border shadow-xl backdrop-blur-sm',
              t.type === 'error'
                ? 'bg-red-600/95 text-white border-red-400'
              : t.type === 'success'
                ? 'bg-emerald-600/95 text-white border-emerald-400'
                : 'bg-gray-900/95 text-white dark:bg-slate-800/95 dark:text-slate-100 border-gray-700',
            ].join(' ')}
          >
            <span aria-hidden className="mt-0.5">
              {t.type === 'error' ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              ) : t.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
              )}
            </span>
            <span className="text-sm leading-5">{t.text}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-auto text-xs opacity-80 hover:opacity-100"
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

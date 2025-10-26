import { useState } from 'react';
import type { TaskListModel } from './types/api';
import { PriorityLevel } from './types/api';
import { api } from './services/api';
import { TaskList } from './components/TaskList';
import { Button } from './components/Button';
import { AuthBar } from './components/AuthBar';
import { Toasts } from './components/Toasts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function App() {
  const [newListName, setNewListName] = useState('');
  const [view, setView] = useState<'home' | 'burning'>('home');
  const queryClient = useQueryClient();

  // Lists query
  const { data: lists = [] } = useQuery<TaskListModel[]>({
    queryKey: ['lists'],
    queryFn: api.getLists,
    meta: { errorMessage: 'Failed to load lists' },
  });

  // Create list mutation
  const createList = useMutation({
    mutationFn: api.createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setNewListName('');
    },
    meta: {
      successMessage: 'List created successfully',
      errorMessage: 'Failed to create list',
    },
  });

  // Create list handler
  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) {
      return;
    }
    createList.mutate({ name });
  };

  // Only show lists that contain at least one fire task when in burning view
  const visibleLists = view === 'burning'
    ? lists?.filter(l => l.taskItems?.some(t => t.priority === PriorityLevel.Fire))
    : lists;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex">
        
        {/* Left Sidebar */}
        <aside className="w-56 shrink-0 px-3 py-8 border-r border-gray-200 dark:border-slate-700 sticky top-0 h-screen">
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => setView('home')}
              className={[
                'w-full text-left px-3 py-2 rounded-md border',
                view === 'home'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              ].join(' ')}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setView('burning')}
              className={[
                'w-full text-left px-3 py-2 rounded-md border',
                view === 'burning'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-2">
                Burning Tasks
                <img src="/fire.svg" alt="" className="h-4 w-4" />
              </span>
            </button>
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Title, Auth, and Theme Selector */}
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {view === 'home' ? 'Home' : (
                    <span className="inline-flex items-center gap-2">
                      Burning Tasks
                      <img src="/fire.svg" alt="" className="h-6 w-6" />
                    </span>
                  )}
                </h1>
                <AuthBar />
              </div>

              {/* Create List Form */}
              {view === 'home' && (
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
              )}

              {/* Task Lists */}
              <div className="grid gap-6 md:grid-cols-2">
                {visibleLists.map(list => (
                   <TaskList
                     key={list.id}
                     list={list}
                     showFireOnly={view === 'burning'}
                   />
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast container */}
      <Toasts />
    </div>
  );
}

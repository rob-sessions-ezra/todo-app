import { useMemo, useState } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';
import { TaskItemRow } from './TaskItemRow';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function getErrMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  try {
    return JSON.stringify(err);
  }
  catch {
    return 'Something went wrong';
  }
}

export function TaskList({
  list,
  onDeleteList,
  onError,
}: {
  list: TaskList;
  onDeleteList: (id: number) => void;
  onError?: (message: string) => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingList, setIsEditingList] = useState(false);
  const [listName, setListName] = useState(list.name);

  const qc = useQueryClient();

  // Tasks per list
  const { data: tasks = [] } = useQuery<TaskItem[]>({
    queryKey: ['tasks', list.id],
    queryFn: () => api.getTasks(list.id),
    onError: (e) => onError?.(getErrMessage(e)),
  });

  // Partition + sort
  const { incompleteTasks, completedTasks } = useMemo(() => {
    const safe = Array.isArray(tasks) ? tasks : [];
    const inc = safe.filter(t => !t.isComplete).sort((a, b) => a.order - b.order);
    const com = safe.filter(t =>  t.isComplete).sort((a, b) => a.order - b.order);
    return { incompleteTasks: inc, completedTasks: com };
  }, [tasks]);

  // --- Mutations (invalidate after success) ---
  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', list.id] });
    },
    onError: (e) => onError?.(getErrMessage(e)),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TaskItem> }) => api.updateTask(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', list.id] });
    },
    onError: (e) => onError?.(getErrMessage(e)),
  });

  const deleteTask = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', list.id] });
    },
    onError: (e) => onError?.(getErrMessage(e)),
  });

  const reorderTasks = useMutation({
    mutationFn: (ids: number[]) => api.reorderTasks(list.id, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', list.id] });
    },
    onError: (e) => onError?.(getErrMessage(e)),
  });

  const deleteList = useMutation({
    mutationFn: api.deleteList,
    onSuccess: () => {
      onDeleteList(list.id);
      qc.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: (e) => onError?.(getErrMessage(e)),
  });

  // --- Handlers ---
  const addTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) {
      return;
    }
    setNewTaskTitle('');
    createTask.mutate({ title, taskListId: list.id });
  };

  const onToggle = (task: TaskItem) => {
    const next = !task.isComplete;
    updateTask.mutate({ id: task.id, payload: { isComplete: next } });
  };

  const onRename = (id: number, title: string) => {
    const next = title.trim();
    if (!next) {
      return;
    }
    updateTask.mutate({ id, payload: { title: next } });
  };

  const onDeleteTask = (id: number) => {
    deleteTask.mutate(id);
  };

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
    if (!next || next === list.name) {
      return cancelEditList();
    }
    try {
      await api.updateListTitle(list.id, next);
      setIsEditingList(false);
      qc.invalidateQueries({ queryKey: ['lists'] });
    } catch (e) {
      onError?.(getErrMessage(e));
    }
  };

  const arrayMove = <T,>(arr: T[], from: number, to: number) => {
    const copy = arr.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }
    if (destination.index === source.index) {
      return;
    }

    const incompleteDroppableId = `incomplete-${list.id}`;
    if (source.droppableId !== incompleteDroppableId || destination.droppableId !== incompleteDroppableId) {
      return;
    }

    const reordered = arrayMove(incompleteTasks, source.index, destination.index);
    const ids = reordered.map(t => t.id);
    reorderTasks.mutate(ids);
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 relative transition hover:shadow-md flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        {isEditingList ? (
          <input
            className="text-lg font-semibold
                       text-gray-900 dark:text-slate-100
                       bg-white dark:bg-slate-900
                       px-2 py-1 border border-gray-300 dark:border-slate-600
                       rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="text-lg font-semibold text-gray-900 dark:text-slate-100 cursor-text"
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
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm 
                       bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100
                       placeholder:text-gray-400 dark:placeholder:text-slate-400
                       focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="submit" disabled={!newTaskTitle.trim()}>Add</Button>
        </form>

        {/* Incomplete tasks */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`incomplete-${list.id}`} type="TASKS">
            {(dropProvided) => (
              <ul ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-2 mb-6">
                {incompleteTasks.map((t, index) => (
                  <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <li
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        style={dragProvided.draggableProps.style}
                        className={[
                          'rounded-md',
                          dragSnapshot.isDragging ? 'opacity-70 ring-2 ring-indigo-300' : '',
                        ].join(' ')}
                      >
                        <TaskItemRow
                          task={t}
                          canDrag={true}
                          onToggle={onToggle}
                          onRename={onRename}
                          onDelete={onDeleteTask}
                          dragHandleProps={dragProvided.dragHandleProps ?? undefined}
                        />
                      </li>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setIsExpanded(v => !v)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-2 hover:text-gray-700 dark:hover:text-slate-200"
            >
              <svg className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span>{completedTasks.length} Completed {completedTasks.length === 1 ? 'item' : 'items'}</span>
            </button>

            {isExpanded && (
              <ul className="space-y-2">
                {completedTasks.map(t => (
                  <li key={t.id} className="rounded-md">
                    <TaskItemRow
                      task={t}
                      canDrag={false}
                      onToggle={onToggle}
                      onRename={onRename}
                      onDelete={onDeleteTask}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Delete list button */}
      <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity border-t border-gray-200 dark:border-slate-700 px-3 py-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            if (!confirm('Delete this list and all its tasks?')) {
              return;
            }
            deleteList.mutate(list.id);
          }}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
          title="Delete list"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

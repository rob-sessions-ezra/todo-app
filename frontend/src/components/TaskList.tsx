import { useEffect, useMemo, useState } from 'react';
import type { TaskItem, TaskList } from '../types/api';
import { api } from '../services/api';
import { Button } from './Button';
import { TaskItemRow } from './TaskItemRow';

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from '@hello-pangea/dnd';

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

  // Derived partitions
  const { incompleteTasks, completedTasks } = useMemo(() => {
    const inc = tasks.filter(t => !t.isComplete).sort((a, b) => a.order - b.order);
    const com = tasks.filter(t => t.isComplete).sort((a, b) => a.order - b.order);
    return { incompleteTasks: inc, completedTasks: com };
  }, [tasks]);

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
    if (!existing) {
      return;
    }
    const next = title.trim();
    if (!next || existing.title === next) {
      return;
    }

    await api.updateTask(id, { ...existing, title: next });
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, title: next } : t)));
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

  // Helpers
  const arrayMove = <T,>(arr: T[], from: number, to: number) => {
    const copy = arr.slice();
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  };

  // ---- Reordering of tasks ----
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // no destination or index unchanged
    if (!destination || destination.index === source.index) {
        return;
    }

    // Only allow reordering inside the incomplete section
    const srcDroppable = source.droppableId;
    const dstDroppable = destination.droppableId;
    const incompleteDroppableId = `incomplete-${list.id}`;
    if (srcDroppable !== incompleteDroppableId || dstDroppable !== incompleteDroppableId) {
        return;
    }

    const reordered = arrayMove(incompleteTasks, source.index, destination.index);

    // Reindex orders inside partitions (incomplete only)
    const nextIncomplete = reordered.map((t, i) => ({ ...t, order: i }));
    const nextCompleted = completedTasks.map((t, i) => ({ ...t, order: i }));

    const byId = new Map<number, TaskItem>([
      ...nextIncomplete.map(t => [t.id, t] as const),
      ...nextCompleted.map(t => [t.id, t] as const),
    ]);

    setTasks(prev => prev.map(t => byId.get(t.id) ?? t));

    // Persist only the incomplete partition order (IDs)
    await api.reorderTasks(list.id, nextIncomplete.map(t => t.id));
  };
  // --------------------------------------------

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 relative transition hover:shadow-md flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        {isEditingList ? (
          <input
            className="text-lg font-semibold text-gray-900 bg-white dark:bg-slate-900 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <ul
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="space-y-2 mb-6"
              >
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

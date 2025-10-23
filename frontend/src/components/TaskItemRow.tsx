import { memo, useState } from 'react';
import type { TaskItem } from '../types/api';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

type Props = {
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onRename: (id: number, title: string) => Promise<void> | void;
  onDelete: (id: number) => void;

  // Reordering
  canDrag: boolean; // true for incomplete tasks
  dragHandleProps?: DraggableProvidedDragHandleProps;
};

function TaskItemRowBase({
  task,
  onToggle,
  onRename,
  onDelete,
  canDrag,
  dragHandleProps,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.title);

  const commit = async () => {
    const next = text.trim();
    setIsEditing(false);

    if (next && next !== task.title) {
      await onRename(task.id, next);
    } else {
      setText(task.title);
    }
  };

  const checkboxId = `task-${task.id}`;

  return (
    <div
      className={[
        'group/task p-2 rounded-md cursor-default',
        'transition-all duration-150 ease-in-out',
        !canDrag ? 'hover:bg-gray-50' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 w-full">
        {/* six-dot drag handle */}
        {canDrag ? (
          <button
            type="button"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            className={[
              'shrink-0 h-5 w-5 grid grid-cols-2 gap-0.5',
              'cursor-grab',
              'text-gray-400 hover:text-gray-500 select-none',
            ].join(' ')}
            {...(dragHandleProps ?? {})}            
          >
            {/* 2x3 dot grid */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <circle cx="8" cy="7" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
              <circle cx="8" cy="17" r="1.5" />
              <circle cx="14" cy="7" r="1.5" />
              <circle cx="14" cy="12" r="1.5" />
              <circle cx="14" cy="17" r="1.5" />
            </svg>
          </button>
        ) : (
          <span className="shrink-0 h-5 w-5" aria-hidden="true" />
        )}

        <input
          id={checkboxId}
          name={checkboxId}
          type="checkbox"
          checked={task.isComplete}
          onChange={() => onToggle(task)}
          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-slate-600"
        />

        {isEditing ? (
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                commit();
              } else if (e.key === 'Escape') {
                setText(task.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <span
            onClick={() => {
              setText(task.title);
              setIsEditing(true);
            }}
            className={`flex-1 cursor-text ${
              task.isComplete ? 'text-gray-400 dark:text-slate-400' : 'text-gray-700 dark:text-slate-200'
            }`}
            title="Click to edit"
          >
            {task.title}
          </span>
        )}

        {/* per-row delete, visible only when hovering this row */}
        <button
          type="button"
          aria-label="Delete task"
          title="Delete task"
          onClick={e => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          onMouseDown={e => e.stopPropagation()}
          className="ml-auto opacity-0 group-hover/task:opacity-100 transition-opacity
                     p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// re-render only if id/title/isComplete change
export const TaskItemRow = memo(
  TaskItemRowBase,
  (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.isComplete === next.task.isComplete
);

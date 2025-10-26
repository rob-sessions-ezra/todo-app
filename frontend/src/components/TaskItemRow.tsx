import { memo, useState } from 'react';
import { PriorityLevel, type TaskItem } from '../types/api';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

type Props = {
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onRename: (id: number, title: string) => Promise<void> | void;
  onDelete: (id: number) => void;
  onToggleFire: (id: number, next: boolean) => void;

  // Reordering
  canDrag: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
};

function TaskItemRowBase({
  task,
  onToggle,
  onRename,
  onDelete,
  onToggleFire,
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
  const isFire = task.priority === PriorityLevel.Fire;

  return (
    <div
      className={[
        'group/task p-2 rounded-md cursor-default',
        'transition-all duration-150 ease-in-out',
        !canDrag ? 'hover:bg-gray-50 dark:hover:bg-slate-700' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 w-full">
        {/* six-dot drag handle */}
        {canDrag && (
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
        )}

        {/* checkbox */}
        <input
          id={checkboxId}
          name={checkboxId}
          type="checkbox"
          checked={task.isComplete}
          onChange={() => onToggle(task)}
          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-slate-600"
        />

        {/* title (edit/view) */}
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
            className="flex-1 px-2 py-1 rounded border
                       border-gray-300 dark:border-slate-600
                       bg-white dark:bg-slate-900
                       text-gray-900 dark:text-slate-100
                       placeholder:text-gray-400 dark:placeholder:text-slate-400
                       focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* fire toggle */}
        <button
          type="button"
          aria-label={isFire ? 'Remove urgent' : 'Mark as urgent'}
          title={isFire ? 'Remove urgent' : 'Mark as urgent'}
          onClick={e => {
            e.stopPropagation();
            onToggleFire(task.id, !isFire);
          }}
          onMouseDown={e => e.stopPropagation()}
          className={[
            'p-1 rounded transition-opacity',
            isFire ? 'opacity-100' : 'opacity-0 group-hover/task:opacity-80',
            'hover:opacity-100 hover:bg-gray-100 dark:hover:bg-slate-700'
          ].join(' ')}
          style={{ lineHeight: 0 }}
        >
          <img src="/fire.svg" alt="" className="h-4 w-4" />
        </button>

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
    prev.task.isComplete === next.task.isComplete &&
    prev.task.priority === next.task.priority &&
    prev.canDrag === next.canDrag
);

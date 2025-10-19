import { memo, useState } from 'react';
import type { TaskItem } from '../types/api';

type Props = {
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onRename: (id: number, title: string) => Promise<void> | void;
  onDelete: (id: number) => void;
};

function TaskItemRowBase({ task, onToggle, onRename, onDelete }: Props) {
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
    <li className="group/task p-2 hover:bg-gray-50 rounded-md">
      <div className="flex items-center gap-3 w-full">
        <input
          id={checkboxId}
          name={checkboxId}
          type="checkbox"
          checked={task.isComplete}
          onChange={() => onToggle(task)}
          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
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
              task.isComplete ? 'text-gray-400 line-through' : 'text-gray-700'
            }`}
            title="Click to edit"
          >
            {task.title}
          </span>
        )}

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
    </li>
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

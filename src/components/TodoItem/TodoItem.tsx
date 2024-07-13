import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

interface TodoItemProps {
  todo: Todo;
  withLoader: boolean;
  onDelete: (todoId: number) => void;
  onUpdate: (data: Todo, isEdited: boolean) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  withLoader,
  onDelete,
  onUpdate,
}) => {
  const [isEdited, setIsEdited] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(todo.title);

  const onSubmit = () => {
    const trimmedTitle = updatedTitle.trim();

    if (!trimmedTitle) {
      onDelete(todo.id);
    } else {
      onUpdate({ ...todo, title: trimmedTitle }, isEdited);
    }

    setIsEdited(false);
  };

  const onEscape = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setUpdatedTitle(todo.title);
      setIsEdited(false);
    }
  };

  useEffect(() => {
    setIsEdited(todo.title !== updatedTitle.trim());
  }, [todo, updatedTitle, withLoader]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleBlur = () => {
    if (isEdited) {
      onSubmit();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
      })}
    >
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() =>
            onUpdate({ ...todo, completed: !todo.completed }, isEdited)
          }
          disabled={isEdited}
        />
      </label>

      {!isEdited ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEdited(true)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(todo.id)}
          >
            ×
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={updatedTitle}
            onChange={event => setUpdatedTitle(event.target.value)}
            onBlur={handleBlur}
            onKeyUp={onEscape}
            autoFocus
          />
        </form>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': withLoader,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

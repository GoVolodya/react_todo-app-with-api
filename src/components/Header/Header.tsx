import React from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

interface HeaderProps {
  todos: Todo[];
  onAdd: (event: React.FormEvent<HTMLFormElement>) => void;
  newTodoTitle: string;
  setNewTodoTitle: (title: string) => void;
  newTodoInput: React.RefObject<HTMLInputElement>;
  isSending: boolean;
  handleToggleAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todos,
  onAdd,
  newTodoTitle,
  setNewTodoTitle,
  newTodoInput,
  isSending,
  handleToggleAll,
}) => {
  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: todos.every(todo => todo.completed) && todos.length > 0,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAll}
        />
      )}

      <form onSubmit={onAdd}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={newTodoInput}
          value={newTodoTitle}
          onChange={event => setNewTodoTitle(event.target.value)}
          disabled={isSending}
        />
      </form>
    </header>
  );
};

import React from 'react';
import classNames from 'classnames';
import { Filter } from '../../types/Filter';
import { Errors } from '../../types/Errors';
import { deleteTodo } from '../../api/todos';
import { Props } from '../../types/Props';

export const Footer: React.FC<Props> = ({ appState, updateState }) => {
  const handleClearCompleted = async () => {
    const completedTodos = appState.todos.filter(todo => todo.completed);

    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [
          ...currentState.loadingTodos,
          ...completedTodos.map(todo => todo.id),
        ],
      };
    });

    const promises = completedTodos.map(todo => {
      return deleteTodo(todo.id).then(() => todo);
    });
    const deleteResults = await Promise.allSettled(promises);

    const deletedTodos = deleteResults.reduce((acc: number[], result) => {
      if (result.status === 'rejected') {
        updateState(currentState => {
          return {
            ...currentState,
            error: Errors.todoDelete,
          };
        });

        return acc;
      }

      acc.push(result.value.id);

      return acc;
    }, []);

    if (deletedTodos.length) {
      updateState(currentState => {
        return {
          ...currentState,
          todos: currentState.todos.filter(
            todo => !deletedTodos.includes(todo.id),
          ),
        };
      });
    }

    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [
          ...currentState.loadingTodos.filter(
            id => !completedTodos.map(todo => todo.id).includes(id),
          ),
        ],
      };
    });
  };

  const handleFilterBy = (filter: Filter) => {
    updateState(currentState => {
      return {
        ...currentState,
        filter: filter,
      };
    });
  };

  const filterBy = appState.filter;
  const todosCounter = appState.todos.filter(todo => !todo.completed).length;
  const hasAnyCompletedTodos = appState.todos.some(todo => todo.completed);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {todosCounter} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filterBy === Filter.all,
          })}
          data-cy="FilterLinkAll"
          onClick={() => handleFilterBy(Filter.all)}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filterBy === Filter.active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => handleFilterBy(Filter.active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filterBy === Filter.completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => handleFilterBy(Filter.completed)}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!hasAnyCompletedTodos}
        onClick={handleClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Props } from '../../types/Props';
import { Errors } from '../../types/Errors';
import { addTodo, updateTodo, USER_ID } from '../../api/todos';

export const Header: React.FC<Props> = ({ appState, updateState }) => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [disableInput, setDisableInput] = useState(false);

  const newTodoInput = useRef<HTMLInputElement>(null);

  const activeToggleAll =
    appState.todos.every(todo => todo.completed) && !!appState.todos.length;

  const focusNewTodoInput = () => {
    if (newTodoInput.current) {
      newTodoInput.current.focus();
    }
  };

  const handleNewTodoFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (disableInput) {
      return;
    }

    const newTitle = newTodoTitle.trim();

    if (!newTitle) {
      updateState(currentState => {
        return {
          ...currentState,
          error: Errors.emptyTitle,
        };
      });

      return;
    }

    setDisableInput(true);

    const newTodo = {
      title: newTitle,
      userId: USER_ID,
      completed: false,
    };

    updateState(currentState => {
      return {
        ...currentState,
        tempTodo: { ...newTodo, id: 0 },
        loadingTodos: [...currentState.loadingTodos, 0],
      };
    });

    try {
      const createdTodo = await addTodo(newTodo).then(response => response);

      updateState(currentState => {
        return {
          ...currentState,
          todos: [...currentState.todos, createdTodo],
        };
      });

      setNewTodoTitle('');
    } catch (error) {
      updateState(currentState => {
        return {
          ...currentState,
          error: Errors.todoCreate,
        };
      });
    } finally {
      setDisableInput(false);
      updateState(currentState => {
        return {
          ...currentState,
          tempTodo: null,
          loadingTodos: currentState.loadingTodos.filter(id => id !== 0),
        };
      });
      focusNewTodoInput();
    }
  };

  const handleToggleAll = async () => {
    const statusShouldBe = appState.todos.some(todo => !todo.completed);
    const todosToUpdate = appState.todos
      .filter(todo => todo.completed !== statusShouldBe)
      .map(todo => {
        return { ...todo, completed: statusShouldBe };
      });

    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [
          ...currentState.loadingTodos,
          ...todosToUpdate.map(todo => todo.id),
        ],
      };
    });

    const promises = todosToUpdate.map(todo => {
      return updateTodo({ ...todo, completed: todo.completed }).then(
        () => todo,
      );
    });
    const updatedResults = await Promise.allSettled(promises);

    const updatedTodos = updatedResults.reduce((acc: number[], result) => {
      if (result.status === 'rejected') {
        updateState(currentState => {
          return {
            ...currentState,
            error: Errors.todoUpdate,
          };
        });

        return acc;
      }

      acc.push(result.value.id);

      return acc;
    }, []);

    if (!!updatedTodos.length) {
      updateState(currentState => {
        return {
          ...currentState,
          todos: currentState.todos.map(todo => {
            if (updatedTodos.includes(todo.id)) {
              return { ...todo, completed: statusShouldBe };
            }

            return todo;
          }),
        };
      });
    }

    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [
          ...currentState.loadingTodos.filter(
            id => !todosToUpdate.map(todo => todo.id).includes(id),
          ),
        ],
      };
    });
  };

  useEffect(() => {
    if (!appState.isEdited) {
      focusNewTodoInput();
    }
  }, [appState]);

  return (
    <header className="todoapp__header">
      {!!appState.todos.length && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: activeToggleAll,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAll}
        />
      )}

      <form onSubmit={handleNewTodoFormSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={newTodoInput}
          value={newTodoTitle}
          onChange={event => setNewTodoTitle(event.target.value)}
          disabled={disableInput}
          autoFocus
        />
      </form>
    </header>
  );
};

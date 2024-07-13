import React, { useState } from 'react';
import { Errors } from '../../types/Errors';
import { Filter } from '../../types/Filter';
import { Todo } from '../../types/Todo';
import { Props } from '../../types/Props';
import { TodoItem } from '../TodoItem/TodoItem';
import { deleteTodo, getTodos, updateTodo } from '../../api/todos';

export const Main: React.FC<Props> = ({ appState, updateState }) => {
  const [initiated, setInitiated] = useState(false);

  if (!initiated) {
    const loadTodos = async () => {
      try {
        const todosFromServer = await getTodos().then(
          loadedTodos => loadedTodos,
        );

        setInitiated(true);
        updateState(currentState => {
          return {
            ...currentState,
            todos: todosFromServer,
          };
        });
      } catch (error) {
        updateState(currentState => {
          return {
            ...currentState,
            error: Errors.todosLoad,
          };
        });
      }
    };

    loadTodos();
  }

  const visibleTodos = appState.todos.filter(todo => {
    switch (appState.filter) {
      case Filter.active:
        return !todo.completed;
      case Filter.completed:
        return todo.completed;
      default:
        return true;
    }
  });

  const handleTodoDelete = async (todoId: number) => {
    if (appState.loadingTodos.includes(todoId)) {
      return;
    }

    const todoToDelete = appState.todos.find(todo => todo.id === todoId);

    if (!todoToDelete) {
      return;
    }

    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [...currentState.loadingTodos, todoId],
      };
    });

    try {
      await deleteTodo(todoToDelete.id).then(response => response);

      updateState(currentState => {
        return {
          ...currentState,
          todos: [
            ...currentState.todos.filter(todo => todo.id !== todoToDelete.id),
          ],
        };
      });
    } catch (error) {
      updateState(currentState => {
        return {
          ...currentState,
          error: Errors.todoDelete,
        };
      });
    } finally {
      updateState(currentState => {
        return {
          ...currentState,
          loadingTodos: [
            ...currentState.loadingTodos.filter(id => id !== todoId),
          ],
        };
      });
    }
  };

  const handleTodoUpdate = async (todo: Todo, isEdited: boolean) => {
    updateState(currentState => {
      return {
        ...currentState,
        loadingTodos: [...currentState.loadingTodos, todo.id],
        isEdited: isEdited,
      };
    });

    try {
      const updated = await updateTodo({ ...todo }).then(response => response);
      const updatedTodos = appState.todos.map(item => {
        if (item.id === todo.id) {
          return { ...item, ...updated };
        }

        return item;
      });

      updateState(currentState => {
        return {
          ...currentState,
          todos: updatedTodos,
        };
      });
    } catch (error) {
      updateState(currentState => {
        return {
          ...currentState,
          error: Errors.todoUpdate,
        };
      });
    } finally {
      updateState(currentState => {
        return {
          ...currentState,
          loadingTodos: currentState.loadingTodos.filter(id => id !== todo.id),
        };
      });
    }
  };

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {visibleTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleTodoDelete}
          onUpdate={handleTodoUpdate}
          withLoader={appState.loadingTodos.includes(todo.id)}
        />
      ))}

      {appState.tempTodo && (
        <TodoItem
          todo={appState.tempTodo}
          onDelete={handleTodoDelete}
          onUpdate={handleTodoUpdate}
          withLoader={appState.loadingTodos.includes(appState.tempTodo.id)}
        />
      )}
    </section>
  );
};

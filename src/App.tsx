/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { Errors } from './types/Errors';
import { Filter } from './types/Filter';
import { Notification } from './components/Notification/Notification';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Main } from './components/Main/Main';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterBy, setFilterBy] = useState(Filter.all);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [todosWithLoader, setTodosWithLoader] = useState<number[]>([]);

  const newTodoInput = useRef<HTMLInputElement>(null);
  const errorMessageTimeout = useRef<number | null>(null);

  const focusNewTodoInput = () => {
    if (newTodoInput.current) {
      newTodoInput.current.focus();
    }
  };

  const handleNewTodoFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSending) {
      return;
    }

    const newTitle = newTodoTitle.trim();

    if (!newTitle) {
      setErrorMessage(Errors.emptyTitle);

      return;
    }

    setIsSending(true);
    setTodosWithLoader([...todosWithLoader, 0]);

    const newTodo = {
      title: newTitle,
      userId: USER_ID,
      completed: false,
    };

    setTempTodo({ ...newTodo, id: 0 });

    try {
      const createdTodo = await addTodo(newTodo).then(response => response);

      setTodos([...todos, createdTodo]);
      setNewTodoTitle('');
    } catch (error) {
      setErrorMessage(Errors.todoCreate);
    } finally {
      setTempTodo(null);
      setIsSending(false);
      setTodosWithLoader(todosWithLoader.filter(id => id !== 0));
      focusNewTodoInput();
    }
  };

  const handleTodoDelete = async (todoId: number) => {
    if (todosWithLoader.includes(todoId)) {
      return;
    }

    const todoToDelete = todos.find(todo => todo.id === todoId);

    if (!todoToDelete) {
      return;
    }

    setIsSending(true);
    setTodosWithLoader([...todosWithLoader, todoId]);

    try {
      await deleteTodo(todoToDelete.id).then(response => response);

      setTodos([...todos.filter(todo => todo.id !== todoToDelete.id)]);
    } catch (error) {
      setErrorMessage(Errors.todoDelete);
    } finally {
      setIsSending(false);
      setTodosWithLoader([...todosWithLoader.filter(id => id !== todoId)]);
      focusNewTodoInput();
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setTodosWithLoader([
      ...todosWithLoader,
      ...completedTodos.map(todo => todo.id),
    ]);

    const promises = completedTodos.map(todo => {
      return deleteTodo(todo.id).then(() => todo);
    });
    const deleteResults = await Promise.allSettled(promises);

    const deletedTodos = deleteResults.reduce((acc: number[], result) => {
      if (result.status === 'rejected') {
        setErrorMessage(Errors.todoDelete);

        return acc;
      }

      acc.push(result.value.id);

      return acc;
    }, []);

    if (deletedTodos.length) {
      setTodos(todos.filter(todo => !deletedTodos.includes(todo.id)));
    }

    setTodosWithLoader([
      ...todosWithLoader.filter(
        id => !completedTodos.map(todo => todo.id).includes(id),
      ),
    ]);
  };

  const handleTodoUpdate = async (todo: Todo) => {
    setIsSending(true);
    setTodosWithLoader([...todosWithLoader, todo.id]);

    try {
      const updated = await updateTodo({ ...todo }).then(response => response);
      const updatedTodos = todos.map(item => {
        if (item.id === todo.id) {
          return { ...item, ...updated };
        }

        return item;
      });

      setTodos(updatedTodos);
    } catch (error) {
      setErrorMessage(Errors.todoUpdate);
    } finally {
      setIsSending(false);
      setTodosWithLoader(todosWithLoader.filter(id => id !== todo.id));
    }
  };

  const handleToggleAll = async () => {
    const shouldBe = todos.some(todo => !todo.completed);
    const todosToUpdate = todos
      .filter(todo => todo.completed !== shouldBe)
      .map(todo => {
        return { ...todo, completed: shouldBe };
      });

    setTodosWithLoader([
      ...todosWithLoader,
      ...todosToUpdate.map(todo => todo.id),
    ]);

    const promises = todosToUpdate.map(todo => {
      return updateTodo({ ...todo, completed: todo.completed }).then(
        () => todo,
      );
    });
    const updatedResults = await Promise.allSettled(promises);

    const updatedTodos = updatedResults.reduce((acc: number[], result) => {
      if (result.status === 'rejected') {
        setErrorMessage(Errors.todoUpdate);

        return acc;
      }

      acc.push(result.value.id);

      return acc;
    }, []);

    if (updatedTodos.length) {
      setTodos(
        todos.map(todo => {
          if (updatedTodos.includes(todo.id)) {
            return { ...todo, completed: shouldBe };
          }

          return todo;
        }),
      );
    }

    setTodosWithLoader([
      ...todosWithLoader.filter(
        id => !todosToUpdate.map(todo => todo.id).includes(id),
      ),
    ]);
  };

  useEffect(() => {
    if (errorMessageTimeout.current) {
      clearTimeout(errorMessageTimeout.current);
    }

    if (errorMessage) {
      errorMessageTimeout.current = window.setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }

    return () => {
      if (errorMessageTimeout.current) {
        clearTimeout(errorMessageTimeout.current);
      }
    };
  }, [errorMessage]);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todosFromServer = await getTodos().then(
          loadedTodos => loadedTodos,
        );

        setTodos(todosFromServer);
      } catch (error) {
        setErrorMessage(Errors.todosLoad);
      } finally {
        focusNewTodoInput();
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    focusNewTodoInput();
  }, [todos, filterBy, errorMessage]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          onAdd={handleNewTodoFormSubmit}
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          newTodoInput={newTodoInput}
          isSending={isSending}
          handleToggleAll={handleToggleAll}
        />

        <Main
          todos={todos}
          filterBy={filterBy}
          tempTodo={tempTodo}
          handleTodoDelete={handleTodoDelete}
          handleTodoUpdate={handleTodoUpdate}
          todosWithLoader={todosWithLoader}
        />

        {todos.length > 0 && (
          <Footer
            todos={todos}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            handleClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      <Notification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

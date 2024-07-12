import React from 'react';
import { TodoItem } from '../TodoItem/TodoItem';
import { Filter } from '../../types/Filter';
import { Todo } from '../../types/Todo';

interface MainProps {
  todos: Todo[];
  filterBy: string;
  tempTodo: Todo | null;
  handleTodoDelete: (todoId: number) => void;
  handleTodoUpdate: (data: Todo) => void;
  todosWithLoader: number[];
}

export const Main: React.FC<MainProps> = ({
  todos,
  filterBy,
  tempTodo,
  handleTodoDelete,
  handleTodoUpdate,
  todosWithLoader,
}) => {
  const visibleTodos = todos.filter(todo => {
    switch (filterBy) {
      case Filter.active:
        return !todo.completed;
      case Filter.completed:
        return todo.completed;
      default:
        return true;
    }
  });

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {visibleTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleTodoDelete}
          onUpdate={handleTodoUpdate}
          withLoader={todosWithLoader.includes(todo.id)}
        />
      ))}

      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          onDelete={handleTodoDelete}
          onUpdate={handleTodoUpdate}
          withLoader={todosWithLoader.includes(tempTodo.id)}
        />
      )}
    </section>
  );
};

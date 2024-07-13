/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import { Errors } from './types/Errors';
import { Filter } from './types/Filter';
import { AppState } from './types/AppState';
import { Notification } from './components/Notification/Notification';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Main } from './components/Main/Main';

const INITIAL_STATE = {
  todos: [],
  error: Errors.noError,
  filter: Filter.all,
  loadingTodos: [],
  tempTodo: null,
  isEdited: false,
};

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header appState={appState} updateState={setAppState} />

        <Main appState={appState} updateState={setAppState} />

        {!!appState.todos.length && (
          <Footer appState={appState} updateState={setAppState} />
        )}
      </div>

      <Notification appState={appState} updateState={setAppState} />
    </div>
  );
};

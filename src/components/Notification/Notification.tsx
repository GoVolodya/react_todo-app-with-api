import React, { useRef } from 'react';
import classNames from 'classnames';
import { Props } from '../../types/Props';
import { Errors } from '../../types/Errors';

export const Notification: React.FC<Props> = ({ appState, updateState }) => {
  const errorMessageTimeout = useRef<number | null>(null);

  if (appState.error) {
    if (errorMessageTimeout.current) {
      clearTimeout(errorMessageTimeout.current);
    }

    errorMessageTimeout.current = window.setTimeout(() => {
      updateState(currentState => {
        return {
          ...currentState,
          error: Errors.noError,
        };
      });
    }, 3000);
  }

  const handleClearError = () => {
    updateState(currentState => {
      return {
        ...currentState,
        error: Errors.noError,
      };
    });
  };

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        {
          hidden: !appState.error,
        },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={handleClearError}
      />
      {appState.error}
    </div>
  );
};

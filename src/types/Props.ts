import { AppState } from './AppState';

export type Props = {
  appState: AppState;
  updateState: (appState: (currentState: AppState) => AppState) => void;
};

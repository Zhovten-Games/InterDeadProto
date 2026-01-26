// Minimal store managing state and dispatching through the reducer.

import reducer, { initialState } from './reducer.js';

export class Store {
  constructor(state = initialState, reducerFn = reducer) {
    this.state = state;
    this.reducer = reducerFn;
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    const { state, effects } = this.reducer(this.state, action);
    this.state = state;
    return effects;
  }
}

export function createStore(state = initialState) {
  return new Store(state);
}

const defaultStore = createStore();
export default defaultStore;


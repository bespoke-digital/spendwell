
import _ from 'lodash';
import { createStore } from 'redux';


const defaultState = {
  loading: 0,
  toasts: [],
};

function reducer(state = defaultState, action) {
  switch (action.type) {
  case 'LOADING_START':
    return {
      ...state,
      loading: state.loading + 1,
    };
  case 'LOADING_STOP':
    return {
      ...state,
      loading: state.loading - 1,
    };
  case 'PUSH_TOAST':
    return {
      ...state,
      toasts: [...state.toasts, action.toast],
    };
  case 'REMOVE_TOAST':
    return {
      ...state,
      toasts: _.without(state.toasts, action.toast),
    };
  default:
    return state;
  }
}


const store = createStore(reducer);

export default store;

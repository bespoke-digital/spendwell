
import { createStore } from 'redux';


function reducer(state = { loading: 0 }, action) {
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
  default:
    return state;
  }
}


const store = createStore(reducer);

export default store;

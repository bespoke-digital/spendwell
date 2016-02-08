
import { createStore } from 'redux'


export default createStore(function reducer(state={ overlayOpen: false }, action) {
  switch (action.type) {
  case 'OVERLAY':
    return Object.assign({}, state, {
      overlayOpen: action.open,
    });
  default:
    return state
  }
});

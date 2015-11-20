
import { createAction, handleActions } from 'redux-actions';
import req from 'lib/req';


const reducer = handleActions({
  CATEGORIES_LOAD: {
    next(state, action) {
      return action.payload;
    },
    throw() {
      return [];
    },
  },
}, []);

const debugReducer = (state)=> {
  debugger;
  return reducer(state);
};

export default debugReducer;

export const load = createAction('CATEGORIES_LOAD', ({ parent })=> {
  return req('GET', '/api/categories', { parent });
});

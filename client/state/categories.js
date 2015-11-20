
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

export default reducer;


export const load = createAction('CATEGORIES_LOAD', ({ parent })=> {
  return req('GET', '/api/categories', { parent });
});


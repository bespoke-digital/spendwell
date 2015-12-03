
import { createAction, handleActions } from 'redux-actions';
import req from 'lib/req';


let initialState = localStorage.getItem('categories');
if (initialState)
  initialState = JSON.parse(initialState);
else
  initialState = [];


export default handleActions({
  LIST_CATEGORIES: {
    next(state, action) {
      localStorage.setItem('categories', JSON.stringify(action.payload));
      return action.payload;
    },
    throw(state) {
      return state;
    },
  },
}, initialState);


export const listCategories = createAction(
  'LIST_CATEGORIES',
  ()=> req('GET', '/api/categories')
);

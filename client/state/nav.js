
import { createAction, handleActions } from 'redux-actions';


export default handleActions({
  NAV_TOGGLE: (state)=> ({ open: !state.open }),
}, { open: false });

export const toggleNav = createAction('NAV_TOGGLE');

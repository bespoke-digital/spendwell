
import { authenticate } from './auth';

export const CONNECTED = 'moneybase/CONNECTED';

export default function(state = {}, action) {}

export function connected() {
  return (dispatch)=> {
    dispatch(authenticate());
    dispatch({ type: CONNECTED });
  };
}

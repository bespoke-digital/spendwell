
import socket from '../socket';


const AUTH_AUTHENTICATE = 'moneybase/AUTH_AUTHENTICATE';
const AUTH_AUTHENTICATE_SUCCESS = 'moneybase/AUTH_AUTHENTICATE_SUCCESS';
const AUTH_AUTHENTICATE_FAIL = 'moneybase/AUTH_AUTHENTICATE_FAIL';


export default function(state = {}, action) {
  switch (action.type) {
  case AUTH_AUTHENTICATE:
    return {
      ...state,
      loading: true,
    };
  case AUTH_AUTHENTICATE_SUCCESS:
    return {
      authenticated: true,
      loading: false,
    };
  case AUTH_AUTHENTICATE_FAIL:
    return {
      authenticated: false,
      loading: false,
      failed: true,
      error: action.reason,
    };
  default:
    return state;
  }
}


export function authenticate() {
  return (dispatch)=> {
    dispatch({ type: AUTH_AUTHENTICATE });

    const apiKey = window.localStorate.getItem('apiKey');
    if (!apiKey) {
      dispatch({ type: AUTH_AUTHENTICATE_FAIL, reason: 'missing key' });
      return;
    }

    socket.emit('auth.authenticate', { apiKey }, function(err, result) {
      if (err) throw err;

      if (result.success)
        dispatch({ type: AUTH_AUTHENTICATE_SUCCESS, user: result.user });
      else
        dispatch({ type: AUTH_AUTHENTICATE_FAIL, reason: result.reacon });
    });
  };
}


import _ from 'lodash';
import { dispatchReq } from 'lib/req';


const AUTH_REFRESH = 'moneybase/AUTH_REFRESH';
const AUTH_REFRESH_SUCCESS = 'moneybase/AUTH_REFRESH_SUCCESS';
const AUTH_REFRESH_FAIL = 'moneybase/AUTH_REFRESH_FAIL';

const AUTH_LOGIN = 'moneybase/AUTH_LOGIN';
const AUTH_LOGIN_SUCCESS = 'moneybase/AUTH_LOGIN_SUCCESS';
const AUTH_LOGIN_FAIL = 'moneybase/AUTH_LOGIN_FAIL';

const AUTH_LOGOUT = 'moneybase/AUTH_LOGOUT';
const AUTH_LOGOUT_SUCCESS = 'moneybase/AUTH_LOGOUT_SUCCESS';
const AUTH_LOGOUT_FAIL = 'moneybase/AUTH_LOGOUT_FAIL';


const defaultState = {
  authenticated: false,
  token: null,
  authenticate: {},
  signup: {},
  login: {},
};

let savedState = localStorage.getItem('auth');
if (savedState)
  savedState = _.extend({}, defaultState, JSON.parse(savedState));

function saveState(state) {
  localStorage.setItem('auth', JSON.stringify({
    authenticated: state.authenticated,
    token: state.token,
    user: state.user,
  }));
  return state;
}


export default function(state, action) {
  if (!state && savedState)
    state = savedState;
  else if (!state)
    state = defaultState;

  switch (action.type) {

  case AUTH_LOGIN:
    return {
      ...state,
      authenticated: false,
      user: null,
      token: null,
      login: { loading: true },
    };
  case AUTH_LOGIN_SUCCESS:
    return saveState({
      ...state,
      authenticated: true,
      token: action.response.auth_token,
      login: { loading: false },
    });
  case AUTH_LOGIN_FAIL:
    return saveState({
      ...state,
      authenticated: false,
      user: null,
      token: null,
      login: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    });

  case AUTH_LOGOUT_SUCCESS:
    return defaultState;

  case AUTH_REFRESH_SUCCESS:
    return saveState({
      ...state,
      user: action.response,
    });
  case AUTH_REFRESH_FAIL:
    return saveState({
      ...state,
      authenticated: false,
      user: null,
      token: null,
    });

  default:
    return state;
  }
}


export function login({ email, password }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGIN, email });
    dispatchReq(
      'POST',
      '/api/auth/login/',
      { email, password },
      dispatch,
      AUTH_LOGIN_SUCCESS,
      AUTH_LOGIN_FAIL
    ).then(()=> dispatch(refresh()));
  };
}


export function logout() {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGOUT });
    dispatchReq('POST', '/api/auth/logout/', dispatch, AUTH_LOGOUT_SUCCESS, AUTH_LOGOUT_FAIL);
  };
}


export function refresh() {
  return (dispatch, getState)=> {
    dispatch({ type: AUTH_REFRESH });

    if (!getState().auth.token)
      return dispatch({ type: AUTH_REFRESH_FAIL });

    dispatchReq('GET', '/api/auth/me/', dispatch, AUTH_REFRESH_SUCCESS, AUTH_REFRESH_FAIL);
  };
}

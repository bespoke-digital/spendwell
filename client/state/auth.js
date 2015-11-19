
import _ from 'lodash';
import req from 'lib/req';


const AUTH_REFRESH = 'moneybase/AUTH_REFRESH';
const AUTH_REFRESH_SUCCESS = 'moneybase/AUTH_REFRESH_SUCCESS';
const AUTH_REFRESH_FAIL = 'moneybase/AUTH_REFRESH_FAIL';

const AUTH_LOGIN = 'moneybase/AUTH_LOGIN';
const AUTH_LOGIN_SUCCESS = 'moneybase/AUTH_LOGIN_SUCCESS';
const AUTH_LOGIN_FAIL = 'moneybase/AUTH_LOGIN_FAIL';

const AUTH_LOGOUT = 'moneybase/AUTH_LOGOUT';
const AUTH_LOGOUT_SUCCESS = 'moneybase/AUTH_LOGOUT_SUCCESS';
const AUTH_LOGOUT_FAIL = 'moneybase/AUTH_LOGOUT_FAIL';

const AUTH_CONNECT = 'moneybase/AUTH_CONNECT';
const AUTH_CONNECT_SUCCESS = 'moneybase/AUTH_CONNECT_SUCCESS';
const AUTH_CONNECT_FAIL = 'moneybase/AUTH_CONNECT_FAIL';


const defaultState = {
  authenticated: false,
  authenticate: {},
  signup: {},
  login: {},
  connect: {},
};

let savedState = localStorage.getItem('auth');
if (savedState)
  savedState = _.extend({}, defaultState, JSON.parse(savedState));

function saveState(state) {
  localStorage.setItem('auth', JSON.stringify({
    authenticated: state.authenticated,
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
      login: { loading: true },
    };
  case AUTH_LOGIN_SUCCESS:
    return saveState({
      ...state,
      authenticated: true,
      user: action.user,
      login: { loading: false },
    });
  case AUTH_LOGIN_FAIL:
    return {
      ...state,
      authenticated: false,
      user: null,
      login: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    };

  case AUTH_LOGOUT_SUCCESS:
    return defaultState;

  case AUTH_REFRESH:
    return {
      ...state,
      refresh: { loading: true, ...state.refresh },
    };
  case AUTH_REFRESH_SUCCESS:
    return saveState({
      ...state,
      authenticated: true,
      user: action.user,
      refresh: { loading: false },
    });
  case AUTH_REFRESH_FAIL:
    return saveState({
      ...state,
      authenticated: false,
      user: null,
      refresh: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    });

  case AUTH_CONNECT:
    return {
      ...state,
      connect: { loading: true },
    };
  case AUTH_CONNECT_SUCCESS:
    return {
      ...state,
      connect: { loading: false },
    };
  case AUTH_CONNECT_FAIL:
    return {
      ...state,
      connect: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    };

  default:
    return state;
  }
}


export function login({ email, password }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGIN, email });

    req('POST', '/api/auth/login', { email, password })
      .then((response)=> dispatch({ type: AUTH_LOGIN_SUCCESS, user: response.user }))
      .catch(()=> dispatch({ type: AUTH_LOGIN_FAIL }));
  };
}


export function logout() {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGOUT });

    req('POST', '/api/auth/logout')
      .then(()=> dispatch({ type: AUTH_LOGOUT_SUCCESS }))
      .catch(()=> dispatch({ type: AUTH_LOGOUT_FAIL }));
  };
}


export function refresh() {
  return (dispatch)=> {
    dispatch({ type: AUTH_REFRESH });

    req('GET', '/api/auth/refresh')
      .then((response)=> dispatch({ type: AUTH_REFRESH_SUCCESS, user: response.user }))
      .catch(()=> dispatch({ type: AUTH_REFRESH_FAIL }));
  };
}

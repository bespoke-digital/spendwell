
import socket from '../socket';


const AUTH_AUTHENTICATE = 'moneybase/AUTH_AUTHENTICATE';
const AUTH_AUTHENTICATE_SUCCESS = 'moneybase/AUTH_AUTHENTICATE_SUCCESS';
const AUTH_AUTHENTICATE_FAIL = 'moneybase/AUTH_AUTHENTICATE_FAIL';

const AUTH_SIGNUP = 'moneybase/AUTH_SIGNUP';
const AUTH_SIGNUP_SUCCESS = 'moneybase/AUTH_SIGNUP_SUCCESS';
const AUTH_SIGNUP_FAIL = 'moneybase/AUTH_SIGNUP_FAIL';

const AUTH_LOGIN = 'moneybase/AUTH_LOGIN';
const AUTH_LOGIN_SUCCESS = 'moneybase/AUTH_LOGIN_SUCCESS';
const AUTH_LOGIN_FAIL = 'moneybase/AUTH_LOGIN_FAIL';

const AUTH_LOGOUT = 'moneybase/AUTH_LOGOUT';
const AUTH_LOGOUT_SUCCESS = 'moneybase/AUTH_LOGOUT_SUCCESS';
const AUTH_LOGOUT_FAIL = 'moneybase/AUTH_LOGOUT_FAIL';

const AUTH_CONNECT = 'moneybase/AUTH_CONNECT';
const AUTH_CONNECT_SUCCESS = 'moneybase/AUTH_CONNECT_SUCCESS';
const AUTH_CONNECT_FAIL = 'moneybase/AUTH_CONNECT_FAIL';


class ApiKey {
  static get() {
    return window.localStorage.getItem('apiKey');
  }

  static set(value) {
    return window.localStorage.setItem('apiKey', value);
  }
}

const defaultState = {
  authenticated: false,
  authenticate: {},
  signup: {},
  login: {},
  connect: {},
};


export default function(state = defaultState, action) {
  switch (action.type) {

  case AUTH_AUTHENTICATE:
    return {
      ...state,
      authenticate: { loading: true, ...state.authenticate },
    };
  case AUTH_AUTHENTICATE_SUCCESS:
    return {
      ...state,
      authenticated: true,
      authenticate: { loading: false },
      user: action.user,
    };
  case AUTH_AUTHENTICATE_FAIL:
    return {
      ...state,
      authenticated: false,
      authenticate: {
        loading: false,
        failed: true,
        error: action.reason,
      },
      user: null,
    };

  case AUTH_SIGNUP:
    return {
      ...state,
      signup: { loading: true },
      user: null,
    };
  case AUTH_SIGNUP_SUCCESS:
    return {
      ...state,
      signup: { loading: false },
      user: action.user,
    };
  case AUTH_SIGNUP_FAIL:
    return {
      ...state,
      signup: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    };

  case AUTH_LOGIN:
    return {
      ...state,
      login: { loading: true },
      user: null,
    };
  case AUTH_LOGIN_SUCCESS:
    return {
      ...state,
      login: { loading: false },
      user: action.user,
    };
  case AUTH_LOGIN_FAIL:
    return {
      ...state,
      login: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    };

  case AUTH_LOGOUT_SUCCESS:
    return defaultState;

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


export function authenticate() {
  return (dispatch)=> {
    dispatch({ type: AUTH_AUTHENTICATE });

    const apiKey = ApiKey.get();
    if (!apiKey) {
      dispatch({ type: AUTH_AUTHENTICATE_FAIL, reason: 'missing key' });
      return;
    }

    socket.emit('auth.authenticate', { apiKey }, function(result) {
      if (result.success)
        dispatch({ type: AUTH_AUTHENTICATE_SUCCESS, user: result.user });
      else
        dispatch({ type: AUTH_AUTHENTICATE_FAIL, reason: result.reason });
    });
  };
}


export function signup({ name, email, password }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_SIGNUP, email });

    socket.emit('auth.signup', { name, email, password }, function(result) {
      if (!result.success) {
        dispatch({ type: AUTH_SIGNUP_FAIL, reason: result.reason });
        return;
      }

      ApiKey.set(result.apiKey);
      dispatch({ type: AUTH_SIGNUP_SUCCESS });
      dispatch(authenticate());
    });
  };
}


export function login({ email, password }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGIN, email });

    socket.emit('auth.login', { email, password }, function(result) {
      if (!result.success) {
        dispatch({ type: AUTH_LOGIN_FAIL, reason: result.reason });
        return;
      }

      ApiKey.set(result.apiKey);
      dispatch({ type: AUTH_LOGIN_SUCCESS });
      dispatch(authenticate());
    });
  };
}


export function logout() {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGOUT });

    socket.emit('auth.logout', function(result) {
      if (!result.success) {
        dispatch({ type: AUTH_LOGOUT_FAIL, reason: result.reason });
        return;
      }

      ApiKey.set(null);
      dispatch({ type: AUTH_LOGOUT_SUCCESS });
    });
  };
}


export function connectPlaid({ publicToken }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_CONNECT });

    socket.emit('plaid.connected', { publicToken }, function(result) {
      if (!result.success) {
        dispatch({ type: AUTH_CONNECT_FAIL, reason: result.reason });
        return;
      }

      dispatch({ type: AUTH_CONNECT_SUCCESS });
      dispatch(authenticate());
    });
  };
}

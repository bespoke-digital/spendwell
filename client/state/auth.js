
const AUTH_REFRESH = 'moneybase/AUTH_REFRESH';
const AUTH_REFRESH_SUCCESS = 'moneybase/AUTH_REFRESH_SUCCESS';
const AUTH_REFRESH_FAIL = 'moneybase/AUTH_REFRESH_FAIL';

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

  case AUTH_LOGIN:
    return {
      ...state,
      authenticated: false,
      user: null,
      login: { loading: true },
    };
  case AUTH_LOGIN_SUCCESS:
    return {
      ...state,
      authenticated: true,
      user: action.user,
      login: { loading: false },
    };
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
    return {
      ...state,
      authenticated: true,
      user: action.user,
      refresh: { loading: false },
    };
  case AUTH_REFRESH_FAIL:
    return {
      ...state,
      authenticated: false,
      user: null,
      refresh: {
        loading: false,
        failed: true,
        error: action.reason,
      },
    };

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

    fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response)=> {
      if (response.status !== 200)
        return Promise.reject(dispatch({ type: AUTH_LOGIN_FAIL }));
      return response.json();
    }).then((response)=> {
      dispatch({ type: AUTH_LOGIN_SUCCESS, user: response.user });
    });
  };
}


export function logout() {
  return (dispatch)=> {
    dispatch({ type: AUTH_LOGOUT });

    fetch('/api/auth/logout', { method: 'POST' }).then((response)=> {
      if (response.status === 200)
        dispatch({ type: AUTH_LOGOUT_SUCCESS });
      else
        dispatch({ type: AUTH_LOGOUT_FAIL });
    });
  };
}


export function refresh() {
  return (dispatch)=> {
    dispatch({ type: AUTH_REFRESH });

    fetch('/api/auth/refresh', { method: 'GET' }).then((response)=> {
      if (response.status !== 200)
        return Promise.reject(dispatch({ type: AUTH_REFRESH_FAIL }));
      return response.json();
    }).then((response)=> {
      dispatch({ type: AUTH_REFRESH_SUCCESS, user: response.user });
    });
  };
}


export function connectPlaid({ publicToken }) {
  return (dispatch)=> {
    dispatch({ type: AUTH_CONNECT });

    console.warn('TODO: plaid.connected');
    // socket.emit('plaid.connected', { publicToken }, function(result) {
    //   if (!result.success) {
    //     dispatch({ type: AUTH_CONNECT_FAIL, reason: result.reason });
    //     return;
    //   }

    //   dispatch({ type: AUTH_CONNECT_SUCCESS });
    //   dispatch(authenticate());
    // });
  };
}


import { dispatchReq } from 'lib/req';


const ACCOUNTS_GET_LIST = 'moneybase/ACCOUNTS_GET_LIST';
const ACCOUNTS_GET_LIST_SUCCESS = 'moneybase/ACCOUNTS_GET_LIST_SUCCESS';
const ACCOUNTS_GET_LIST_FAIL = 'moneybase/ACCOUNTS_GET_LIST_FAIL';


const defaultState = { loading: false, list: [] };


export default function(state = defaultState, action) {
  switch (action.type) {

  case ACCOUNTS_GET_LIST:
    return {
      ...state,
      loading: true,
    };
  case ACCOUNTS_GET_LIST_SUCCESS:
    return {
      list: action.response,
      loading: false,
    };
  case ACCOUNTS_GET_LIST_FAIL:
    return {
      ...defaultState,
      loading: false,
      failed: true,
    };

  default:
    return state;
  }
}


export function getList() {
  return (dispatch, getState)=> {
    dispatch({ type: ACCOUNTS_GET_LIST });

    if (!getState().auth.authenticated)
      return dispatch({ type: ACCOUNTS_GET_LIST_FAIL });

    dispatchReq(
      'GET',
      '/api/accounts',
      dispatch,
      ACCOUNTS_GET_LIST_SUCCESS,
      ACCOUNTS_GET_LIST_FAIL
    );
  };
}

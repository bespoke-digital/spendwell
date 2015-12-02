
import { dispatchReq } from 'lib/req';


const TRANSACTIONS_GET_LIST = 'moneybase/TRANSACTIONS_GET_LIST';
const TRANSACTIONS_GET_LIST_SUCCESS = 'moneybase/TRANSACTIONS_GET_LIST_SUCCESS';
const TRANSACTIONS_GET_LIST_FAIL = 'moneybase/TRANSACTIONS_GET_LIST_FAIL';


export default function(state = {
  loading: false,
  list: [],
}, action) {
  switch (action.type) {

  case TRANSACTIONS_GET_LIST:
    return {
      ...state,
      loading: true,
    };
  case TRANSACTIONS_GET_LIST_SUCCESS:
    return {
      ...state,
      list: action.response,
      loading: false,
    };
  case TRANSACTIONS_GET_LIST_FAIL:
    return {
      ...state,
      loading: false,
      failed: true,
    };

  default:
    return state;
  }
}


export function listTransactions(filters) {
  return (dispatch, getState)=> {
    dispatch({ type: TRANSACTIONS_GET_LIST });

    if (!getState().auth.authenticated)
      return dispatch({ type: TRANSACTIONS_GET_LIST_FAIL });

    dispatchReq(
      'GET',
      '/api/transactions',
      filters,
      dispatch,
      TRANSACTIONS_GET_LIST_SUCCESS,
      TRANSACTIONS_GET_LIST_FAIL
    );
  };
}

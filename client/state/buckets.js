
import { dispatchReq } from 'lib/req';


const BUCKETS_GET_LIST = 'moneybase/BUCKETS_GET_LIST';
const BUCKETS_GET_LIST_SUCCESS = 'moneybase/BUCKETS_GET_LIST_SUCCESS';
const BUCKETS_GET_LIST_FAIL = 'moneybase/BUCKETS_GET_LIST_FAIL';


const defaultState = { loading: false, list: [] };


export default function(state = defaultState, action) {
  switch (action.type) {

  case BUCKETS_GET_LIST:
    return {
      ...state,
      loading: true,
    };
  case BUCKETS_GET_LIST_SUCCESS:
    return {
      list: action.response,
      loading: false,
    };
  case BUCKETS_GET_LIST_FAIL:
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
    dispatch({ type: BUCKETS_GET_LIST });

    if (!getState().auth.authenticated)
      return dispatch({ type: BUCKETS_GET_LIST_FAIL });

    dispatchReq(
      'GET',
      '/api/buckets',
      dispatch,
      BUCKETS_GET_LIST_SUCCESS,
      BUCKETS_GET_LIST_FAIL
    );
  };
}

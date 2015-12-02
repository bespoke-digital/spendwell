
import { dispatchReq } from 'lib/req';


const BUCKETS_GET = 'moneybase/BUCKETS_GET';
const BUCKETS_GET_SUCCESS = 'moneybase/BUCKETS_GET_SUCCESS';
const BUCKETS_GET_FAIL = 'moneybase/BUCKETS_GET_FAIL';

const BUCKETS_GET_LIST = 'moneybase/BUCKETS_GET_LIST';
const BUCKETS_GET_LIST_SUCCESS = 'moneybase/BUCKETS_GET_LIST_SUCCESS';
const BUCKETS_GET_LIST_FAIL = 'moneybase/BUCKETS_GET_LIST_FAIL';

const BUCKETS_CREATE = 'moneybase/BUCKETS_CREATE';
const BUCKETS_CREATE_SUCCESS = 'moneybase/BUCKETS_CREATE_SUCCESS';
const BUCKETS_CREATE_FAIL = 'moneybase/BUCKETS_CREATE_FAIL';

const BUCKETS_UPDATE = 'moneybase/BUCKETS_UPDATE';
const BUCKETS_UPDATE_SUCCESS = 'moneybase/BUCKETS_UPDATE_SUCCESS';
const BUCKETS_UPDATE_FAIL = 'moneybase/BUCKETS_UPDATE_FAIL';


export default function(state = {
  loading: false,
  list: [],
  create: { loading: false, bucket: {} },
  get: { loading: false, bucket: {} },
  update: { loading: false, bucket: {} },
}, action) {
  switch (action.type) {

  case BUCKETS_GET:
    return {
      ...state,
      get: { loading: true, bucket: {} },
    };
  case BUCKETS_GET_SUCCESS:
    return {
      ...state,
      get: { loading: false, failed: false, bucket: action.response },
    };
  case BUCKETS_GET_FAIL:
    return {
      ...state,
      get: { loading: false, failed: true, bucket: {} },
    };

  case BUCKETS_GET_LIST:
    return {
      ...state,
      loading: true,
    };
  case BUCKETS_GET_LIST_SUCCESS:
    return {
      ...state,
      list: action.response,
      loading: false,
    };
  case BUCKETS_GET_LIST_FAIL:
    return {
      ...state,
      loading: false,
      failed: true,
    };

  case BUCKETS_CREATE:
    return {
      ...state,
      create: { loading: true },
    };
  case BUCKETS_CREATE_SUCCESS:
    return {
      ...state,
      create: { loading: false, failed: false, bucket: action.response },
    };
  case BUCKETS_CREATE_FAIL:
    return {
      ...state,
      create: { loading: false, failed: true, error: action.reason },
    };

  case BUCKETS_UPDATE:
    return {
      ...state,
      update: { loading: true },
    };
  case BUCKETS_UPDATE_SUCCESS:
    return {
      ...state,
      update: { loading: false, failed: false, bucket: action.response },
    };
  case BUCKETS_UPDATE_FAIL:
    return {
      ...state,
      update: { loading: false, failed: true, error: action.reason },
    };

  default:
    return state;
  }
}


export function getBucket({ id }) {
  return (dispatch, getState)=> {
    dispatch({ type: BUCKETS_GET });

    if (!getState().auth.authenticated)
      return dispatch({ type: BUCKETS_GET_FAIL });

    dispatchReq(
      'GET',
      `/api/buckets/${id}`,
      dispatch,
      BUCKETS_GET_SUCCESS,
      BUCKETS_GET_FAIL
    );
  };
}


export function listBuckets() {
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


export function createBucket(data) {
  return (dispatch, getState)=> {
    dispatch({ type: BUCKETS_CREATE });

    if (!getState().auth.authenticated)
      return dispatch({ type: BUCKETS_CREATE_FAIL });

    dispatchReq(
      'POST',
      '/api/buckets',
      data,
      dispatch,
      BUCKETS_CREATE_SUCCESS,
      BUCKETS_CREATE_FAIL
    );
  };
}


export function updateBucket({ id, ...data }) {
  return (dispatch, getState)=> {
    dispatch({ type: BUCKETS_UPDATE });

    if (!getState().auth.authenticated)
      return dispatch({ type: BUCKETS_UPDATE_FAIL });

    dispatchReq(
      'PATCH',
      `/api/buckets/${id}`,
      data,
      dispatch,
      BUCKETS_UPDATE_SUCCESS,
      BUCKETS_UPDATE_FAIL
    );
  };
}

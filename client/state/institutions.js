
import req from 'lib/req';

const INSTITUTIONS_CONNECT = 'moneybase/INSTITUTIONS_CONNECT';
const INSTITUTIONS_CONNECT_SUCCESS = 'moneybase/INSTITUTIONS_CONNECT_SUCCESS';
const INSTITUTIONS_CONNECT_FAIL = 'moneybase/INSTITUTIONS_CONNECT_FAIL';

const TRANSACTIONS_FETCH = 'moneybase/TRANSACTIONS_FETCH';
const TRANSACTIONS_FETCH_SUCCESS = 'moneybase/TRANSACTIONS_FETCH_SUCCESS';
const TRANSACTIONS_FETCH_FAIL = 'moneybase/TRANSACTIONS_FETCH_FAIL';

const SELECT_ACCOUNT = 'moneybase/SELECT_ACCOUNT';


export default function(state = {
  loading: false,
  selectedAccount: null,
  accounts: [],
  transactions: [],
  connect: {},
}, action) {
  switch (action.type) {

  case INSTITUTIONS_CONNECT:
    return {
      ...state,
      connect: { loading: true },
    };
  case INSTITUTIONS_CONNECT_SUCCESS:
    return {
      ...state,
      connect: { loading: false, failed: false },
    };
  case INSTITUTIONS_CONNECT_FAIL:
    return {
      ...state,
      connect: { loading: false, failed: true, error: action.reason },
    };

  case TRANSACTIONS_FETCH:
    return {
      ...state,
      loading: true,
    };
  case TRANSACTIONS_FETCH_SUCCESS:
    return {
      ...state,
      loading: false,
      accounts: action.response.accounts,
      transactions: action.response.transactions,
    };
  case TRANSACTIONS_FETCH_FAIL:
    return {
      ...state,
      loading: false,
      failed: true,
      error: action.reason,
    };

  case SELECT_ACCOUNT:
    return {
      ...state,
      selectedAccount: action.account,
    };

  default:
    return state;
  }
}


export function fetch() {
  return (dispatch, getState)=> {
    dispatch({ type: TRANSACTIONS_FETCH });

    const state = getState().institutions;
    const args = { account: null };
    if (state.selectedAccount)
      args.account = state.selectedAccount._id;

    console.warn('TODO: plaid.transactions');
    // socket.emit('plaid.transactions', args, (response)=> {
    //   if (response.success)
    //     dispatch({ type: TRANSACTIONS_FETCH_SUCCESS, response });
    //   else
    //     dispatch({ type: TRANSACTIONS_FETCH_FAIL, reason: response.reason });
    // });
  };
}


export function selectAccount({ account }) {
  return (dispatch)=> {
    dispatch({ type: SELECT_ACCOUNT, account });
    dispatch(fetch());
  };
}

export function connect({ id, publicToken }) {
  return (dispatch)=> {
    dispatch({ type: INSTITUTIONS_CONNECT });

    req('POST', '/api/institutions', { id, public_token: publicToken })
      .then((response)=> dispatch({
        type: INSTITUTIONS_CONNECT_SUCCESS,
        institution: response.institution,
      }))
      .catch(()=> dispatch({ type: INSTITUTIONS_CONNECT_FAIL }));
  };
}

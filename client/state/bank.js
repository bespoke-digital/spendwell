
const TRANSACTIONS_FETCH = 'moneybase/TRANSACTIONS_FETCH';
const TRANSACTIONS_FETCH_SUCCESS = 'moneybase/TRANSACTIONS_FETCH_SUCCESS';
const TRANSACTIONS_FETCH_FAIL = 'moneybase/TRANSACTIONS_FETCH_FAIL';

const SELECT_ACCOUNT = 'moneybase/SELECT_ACCOUNT';


export default function(state = {
  loading: false,
  selectedAccount: null,
  accounts: [],
  transactions: [],
}, action) {
  switch (action.type) {

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

    const state = getState().bank;
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

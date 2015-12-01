
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { reduxReactRouter, routerStateReducer } from 'redux-router';
import createHistory from 'history/lib/createBrowserHistory';
import promiseMiddleware from 'redux-promise';

import routes from './routes';
import auth from './state/auth';
import institutions from './state/institutions';
import categories from './state/categories';
import accounts from './state/accounts';


const reducerMap = {
  // reducers:
  categories,
  auth,
  institutions,
  accounts,
  router: routerStateReducer,
};
console.log(reducerMap);

export default compose(
  reduxReactRouter({ routes, createHistory }),
  applyMiddleware(
    // middleware:
    thunk,
    promiseMiddleware,
    createLogger()
  )
)(createStore)(combineReducers(reducerMap));

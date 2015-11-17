
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import auth from './state/auth';
import bank from './state/bank';


export default applyMiddleware(
  // middleware:
  thunk
)(createStore)(combineReducers({
  // reducers:
  auth,
  bank,
}));

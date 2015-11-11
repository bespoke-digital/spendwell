
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import auth from './state/auth';


export default applyMiddleware(
  // middleware:
  thunk
)(createStore)(combineReducers({
  // reducers:
  auth,
}));


import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import auth from './state/auth';
import institutions from './state/institutions';


export default applyMiddleware(
  // middleware:
  thunk
)(createStore)(combineReducers({
  // reducers:
  auth,
  institutions,
}));

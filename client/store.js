
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import auth from './state/auth';
import institutions from './state/institutions';


const logger = createLogger();

export default applyMiddleware(
  // middleware:
  thunk,
  logger
)(createStore)(combineReducers({
  // reducers:
  auth,
  institutions,
}));

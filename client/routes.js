
import { Router, Route, Redirect } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import Dashboard from './components/dashboard';
import Connect from './components/connect';
// import Signup from './components/signup';
import Login from './components/login';
import Logout from './components/logout';
import store from './store';


function requireAuth(nextState, replaceState) {
  if (!store.getState().auth.authenticated)
    replaceState({ next: nextState.location.pathname }, '/login');
}

export default (
  <Router history={createBrowserHistory()}>
    <Route path='/login' component={Login}/>
    <Route path='/logout' component={Logout}/>
    <Route path='/' component={App} onEnter={requireAuth}>
      <Route path='dashboard' component={Dashboard}/>
      <Route path='connect' component={Connect}/>
      <Redirect to='dashboard'/>
    </Route>
  </Router>
);

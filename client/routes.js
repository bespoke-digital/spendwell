
import { Router, Route, Redirect } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import Dashboard from './components/dashboard';
import Connect from './components/connect';
// import Signup from './components/signup';
import Login from './components/login';
import Logout from './components/logout';


export default (
  <Router history={createBrowserHistory()}>
    <Route path='/' component={App}>
      <Route path='dashboard' component={Dashboard}/>
      <Route path='connect' component={Connect}/>
      <Route path='login' component={Login}/>
      <Route path='logout' component={Logout}/>
      <Redirect to='dashboard'/>
    </Route>
  </Router>
);

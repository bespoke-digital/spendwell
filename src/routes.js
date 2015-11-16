
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import Home from './components/home';
import Connect from './components/connect';
import Signup from './components/signup';
import Login from './components/login';
import Logout from './components/logout';


export default (
  <Router history={createBrowserHistory()}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route path='connect' component={Connect}/>
      <Route path='signup' component={Signup}/>
      <Route path='login' component={Login}/>
      <Route path='logout' component={Logout}/>
    </Route>
  </Router>
);

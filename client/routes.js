
import { Route, Redirect } from 'react-router';
import { ReduxRouter } from 'redux-router';

import App from './components/app';
import Dashboard from './components/dashboard';
import Connect from './components/connect';
import Login from './components/login';
import Logout from './components/logout';


export default (
  <ReduxRouter>
    <Route path='/login' component={Login}/>
    <Route path='/logout' component={Logout}/>
    <Route path='/' component={App}>
      <Route path='dashboard' component={Dashboard}/>
      <Route path='connect' component={Connect}/>
      <Redirect to='dashboard'/>
    </Route>
  </ReduxRouter>
);


import { Route, Redirect } from 'react-router';
import { ReduxRouter } from 'redux-router';

import App from './views/app';
import Dashboard from './views/dashboard';
import Accounts from './views/accounts';
import Connect from './views/connect';
import Login from './views/login';
import Logout from './views/logout';
import CreateBucket from './views/create-bucket';
import Bucket from './views/bucket';


export default (
  <ReduxRouter>
    <Route path='/login' component={Login}/>
    <Route path='/logout' component={Logout}/>
    <Route path='/' component={App}>
      <Route path='dashboard' component={Dashboard}/>
      <Route path='accounts' component={Accounts}/>
      <Route path='connect' component={Connect}/>
      <Route path='buckets/new' component={CreateBucket}/>
      <Route path='buckets/:id' component={Bucket}/>
      <Redirect to='dashboard'/>
    </Route>
  </ReduxRouter>
);

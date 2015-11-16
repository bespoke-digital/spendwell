
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import Connect from './components/connect';


export default (
  <Router history={createBrowserHistory()}>
    <Route path='/' component={App}>
      <Route path='connect' component={Connect}/>
    </Route>
  </Router>
);


import { Router, Route } from 'react-router';

import App from './components/app';
import Connect from './components/connect';


export default (
  <Router>
    <Route path='/' component={App}>
      <Route path='connect' component={Connect}/>
    </Route>
  </Router>
);

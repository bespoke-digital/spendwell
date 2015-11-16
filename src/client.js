import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin(); // needed for material-ui

import { render } from 'react-dom';
import { Provider } from 'react-redux';

import './sass/base.scss';
import routes from './routes';
import store from './store';
import { authenticate } from 'state/auth';


store.dispatch(authenticate());

render(<Provider store={store}>{routes}</Provider>, document.getElementById('root'));

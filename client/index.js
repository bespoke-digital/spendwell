
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import './sass/base.scss';
import routes from './routes';
import store from './store';


render(<Provider store={store}>{routes}</Provider>, document.getElementById('root'));

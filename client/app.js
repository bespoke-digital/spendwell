
import 'sass/app';

import { render } from 'react-dom';
import Relay from 'react-relay';
import { Provider } from 'react-redux';

import store from 'store';
import routes from 'routes';
import networkLayer from 'utils/network-layer';


Relay.injectNetworkLayer(networkLayer);


window.onload = ()=> render(
  <Provider store={store}>{routes}</Provider>,
  document.getElementById('root'),
);

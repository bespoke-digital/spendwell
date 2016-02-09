
import 'sass/app';

import { render } from 'react-dom';
import Relay from 'react-relay';

import routes from 'routes';
import networkLayer from 'utils/network-layer';


Relay.injectNetworkLayer(networkLayer);


window.onload = ()=> render(routes, document.getElementById('root'));


import 'sass/app.scss';

import { render } from 'react-dom';
import routes from 'routes';
import Relay from 'react-relay';

import networkLayer from 'utils/network-layer';


Relay.injectNetworkLayer(networkLayer);


window.onload = ()=> render(routes, document.getElementById('root'));

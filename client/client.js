
import { render } from 'react-dom';
import 'sass/base.scss';
import routes from 'routes';


Meteor.startup(()=> render(routes, document.getElementById('root')));

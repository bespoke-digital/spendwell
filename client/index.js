
import { render } from 'react-dom';
import 'sass/base.scss';
import routes from 'routes';


window.onload = ()=> render(routes, document.getElementById('root'));

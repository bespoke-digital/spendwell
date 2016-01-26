
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


export default (props)=> (
  <ReactCSSTransitionGroup
    transitionEnterTimeout={500}
    transitionLeaveTimeout={500}
    {...props}
  />
);

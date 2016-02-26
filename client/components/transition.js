
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


export default (props)=> {
  const { name, ...childProps } = props;

  childProps.transitionName = `${name}-transition`;

  childProps.className = childProps.className || '';
  childProps.className += ` ${name}-transition`;

  childProps.transitionEnterTimeout = 500;
  childProps.transitionLeaveTimeout = 500;

  return <ReactCSSTransitionGroup {...childProps}/>;
};

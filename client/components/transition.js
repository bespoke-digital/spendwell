
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


export default (props)=> {
  const { name, ...childProps } = props;

  if (name && !childProps.transitionName)
    childProps.transitionName = name;

  childProps.transitionEnterTimeout = 500;
  childProps.transitionLeaveTimeout = 500;

  return <ReactCSSTransitionGroup {...childProps}/>;
};

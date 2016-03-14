
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


export default (props)=> {
  const { name, show, children, ..._props } = props;

  _props.transitionName = `${name}-transition`;

  _props.className = _props.className || '';
  _props.className += ` ${name}-transition`;

  _props.transitionEnterTimeout = 500;
  _props.transitionLeaveTimeout = 500;

  return (
    <div {..._props}>
      {show ? children : null}
    </div>
  );
  // return (
  //   <ReactCSSTransitionGroup {..._props}>
  //     {show ? children : null}
  //   </ReactCSSTransitionGroup>
  // );
};

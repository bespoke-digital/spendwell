
export default (props)=> {
  let { className, varient, ...extraProps } = props;

  className = className || '';
  className += ' mui-btn';
  if (varient)
    className += ` mui-btn--${varient}`;

  return (
    <button className={className} {...props}>
      {props.children}
    </button>
  );
};

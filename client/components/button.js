
import { Link } from 'react-router';
import { browserHistory } from 'react-router';


export default (props)=> {
  const {
    className,
    variant,
    raised,
    fab,
    disabled,
    type,
    propagateClick,
    ...extraProps,
  } = props;

  let classes = className || '';
  classes += ' mui-btn';
  if (variant)
    classes += ` mui-btn--${variant}`;
  if (raised)
    classes += ' mui-btn--raised';
  if (fab)
    classes += ' mui-btn--fab';
  if (disabled)
    classes += ' mui--is-disabled';

  if (propagateClick === false && extraProps.onClick) {
    const onClick = extraProps.onClick;
    extraProps.onClick = function(event, ...args) {
      event.stopPropagation();
      onClick(event, ...args);
    };
  } else if (propagateClick === false && extraProps.to) {
    extraProps.onClick = (event)=> event.stopPropagation();
  }

  if (props.to)
    return <Link className={classes} {...extraProps}/>;
  else if (props.href)
    return <a className={classes} {...extraProps}/>;
  else
    return <button
      className={classes}
      disabled={!!disabled}
      type={type || 'button'}
      {...extraProps}
    />;
};

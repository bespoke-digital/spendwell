
import { Link } from 'react-router';
import Transition from 'components/transition';


export default (props)=> {
  const {
    className,
    variant,
    raised,
    fab,
    disabled,
    flat,
    type,
    propagateClick,
    loading,
    children,
    ...extraProps,
  } = props;

  const _disabled = disabled || loading;
  const _children = children;

  let classes = className || '';
  classes += ' mui-btn';
  if (variant)
    classes += ` mui-btn--${variant}`;
  if (raised)
    classes += ' mui-btn--raised';
  if (flat)
    classes += ' mui-btn--flat';
  if (fab)
    classes += ' mui-btn--fab';
  if (_disabled)
    classes += ' mui--is-disabled';
  if (loading)
    classes += ' mui-btn--is-loading';

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
    return <Link className={classes} {...extraProps}>{_children}</Link>;
  else if (props.href)
    return <a className={classes} {...extraProps}>{_children}</a>;
  else
    return <button
      className={classes}
      disabled={!!_disabled}
      type={type || 'button'}
      {...extraProps}
    >{_children}</button>;
};


import _ from 'lodash';
import { Link } from 'react-router';


export default (props)=> {
  const {
    className,
    variant,
    raised,
    fab,
    disabled,
    flat,
    plain,
    type,
    propagateClick,
    loading,
    children,
    onClick,
    ...extraProps,
  } = props;

  const _disabled = disabled;
  const _children = children;

  let classes = className || '';
  classes += ' mui-btn';
  if (variant)
    classes += ` mui-btn--${variant}`;
  if (raised)
    classes += ' mui-btn--raised';
  if (flat || plain)
    classes += ' mui-btn--flat';
  if (plain)
    classes += ' mui-btn--plain';
  if (fab)
    classes += ' mui-btn--fab';
  if (_disabled)
    classes += ' mui--is-disabled';
  if (!_.isUndefined(loading))
    classes += ' mui-btn--can-load';
  if (loading)
    classes += ' mui-btn--is-loading';

  extraProps.onClick = function(event, ...args) {
    if (propagateClick === false)
      event.stopPropagation();

    if (loading) {
      event.preventDefault();
      return;
    }

    if (onClick)
      onClick(event, ...args);
  };

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

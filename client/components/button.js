
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { Link } from 'react-router';


export default class Button extends Component {
  static propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'primary', 'danger', 'dark', 'accent']),
    raised: PropTypes.bool,
    fab: PropTypes.bool,
    disabled: PropTypes.bool,
    flat: PropTypes.bool,
    plain: PropTypes.bool,
    propagateClick: PropTypes.bool,
    loading: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit']),
    onClick: PropTypes.func,
    to: PropTypes.string,
    href: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    variant: 'primary',
    raised: false,
    fab: false,
    disabled: false,
    flat: false,
    plain: false,
    propagateClick: false,
    loading: false,
    type: 'button',
  };

  render() {
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
      to,
      href,
      ...extraProps,
    } = this.props;

    let classes = className || '';
    classes += ' mui-btn btn';
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
    if (disabled)
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

    if (to)
      return <Link className={classes} to={to} {...extraProps}>{children}</Link>;
    else if (href)
      return <a className={classes} href={href} {...extraProps}>{children}</a>;
    else
      return <button
        className={classes}
        disabled={!!disabled}
        type={type || 'button'}
        {...extraProps}
      >{children}</button>;
  }
}

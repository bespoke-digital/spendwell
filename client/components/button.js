
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { Link } from 'react-router';


export default class Button extends Component {
  static propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'primary', 'danger', 'dark', 'accent']),
    color: PropTypes.oneOf(['default', 'primary', 'danger', 'dark', 'accent']),
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
    color: 'primary',
    raised: false,
    fab: false,
    disabled: false,
    flat: false,
    plain: false,
    propagateClick: false,
    loading: false,
    type: 'button',
  };

  onClick(event, ...args) {
    const { propagateClick, loading, onClick } = this.props;

    if (propagateClick === false)
      event.stopPropagation();

    if (loading) {
      event.preventDefault();
      return;
    }

    if (onClick)
      onClick(event, ...args);
  }

  classes() {
    const {
      className,
      variant,
      color,
      raised,
      fab,
      disabled,
      flat,
      plain,
      loading,
    } = this.props;

    let classes = className || '';
    classes += ' mui-btn btn';
    if (variant || color)
      classes += ` mui-btn--${variant || color}`;
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

    return classes;
  }

  render() {
    const { disabled, type, to, href, children } = this.props;

    const props = {
      onClick: ::this.onClick,
      className: this.classes(),
      children,
    };

    return (to ?
      <Link to={to} {...props}/>
    : href ?
      <a href={href} {...props}/>
    :
      <button disabled={disabled} type={type} {...props}/>
    );
  }
}

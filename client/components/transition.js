
import { Component, PropTypes } from 'react';

import style from 'sass/components/transition';


export default class Transition extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    out: PropTypes.bool,
    name: PropTypes.string,
  };

  static defaultProps = {
    out: false,
    name: 'fade',
  };

  constructor({ show }) {
    super();
    this.state = { visible: show };
    this.animationComplete = ::this.animationComplete;
  }

  componentDidMount() {
    this.refs.root.addEventListener('webkitAnimationEnd', this.animationComplete, false);
    this.refs.root.addEventListener('animationend', this.animationComplete, false);
    this.refs.root.addEventListener('oanimationend', this.animationComplete, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      if (!this.props.show)
        self.timeout = setTimeout(()=> {
          this.setState({ visible: nextProps.show });
          self.timeout = null;
        }, 1);

      else if (!this.props.out)
        this.setState({ visible: nextProps.show });
    }
  }

  componentWillUnmount() {
    if (self.timeout)
      clearTimeout(self.timeout);

    this.refs.root.removeEventListener('webkitAnimationEnd', this.animationComplete);
    this.refs.root.removeEventListener('animationend', this.animationComplete);
    this.refs.root.removeEventListener('oanimationend', this.animationComplete);
  }

  animationComplete() {
    const { show, out } = this.props;
    if (out)
      this.setState({ visible: show });
  }

  render() {
    const { name, show, out, children, ..._props } = this.props;
    const { visible } = this.state;

    return (
      <div className={`${style.root} ${name}-transition`} {..._props} ref='root'>
        {show || visible ?
          <div className={`${name} ${show && visible ? 'in' : ''}`}>
            {children}
          </div>
        : null}
      </div>
    );
  }
}

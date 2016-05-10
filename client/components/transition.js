
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
  }

  render() {
    const { name, show, children, ..._props } = this.props;
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


import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Transition from 'components/transition';
import Card from 'components/card';

import style from 'sass/components/dialog';


class Dialog extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
  };

  static defaultProps = {
    visible: false,
    size: 'md',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible)
      this.props.dispatch({ type: 'OVERLAY', open: nextProps.visible });
  }

  render() {
    const { visible, children, size } = this.props;

    return (
      <Transition name='fade' show={visible}>
        <Card className={`${style.root} ${size}`}>
          {children}
        </Card>
      </Transition>
    );
  }
}

Dialog = connect(function(state) {
  return { overlayOpen: state.overlayOpen };
})(Dialog);

export default Dialog;


import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Transition from 'components/transition';
import Card from 'components/card';

import style from 'sass/components/dialog';


class Dialog extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    visible: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      this.props.dispatch({ type: 'OVERLAY', open: nextProps.visible });
      console.log('dispatch');
    }
  }

  render() {
    const { visible, children } = this.props;

    return (
      <Transition name='fade' show={visible}>
        <Card className={style.root}>
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

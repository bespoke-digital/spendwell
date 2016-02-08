
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Card from 'components/card';
import Transition from 'components/transition';

import style from 'sass/components/modal';


@connect((state)=> ({ overlayOpen: state.overlayOpen }))
export default class Modal extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    overlayOpen: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { open } = this.props;
    this.props.dispatch({ type: 'OVERLAY', open });
  }

  componentWillReceiveProps(nextProps) {
    const { overlayOpen, dispatch, onClose, open } = this.props;

    if (!nextProps.overlayOpen && overlayOpen && onClose)
      return onClose();

    if (nextProps.open !== open)
      dispatch({ type: 'OVERLAY', open: nextProps.open });
  }

  render() {
    const { children, open } = this.props;
    return (
      <Transition transitionName='modal'>{open ?
        <Card className={style.root}>{children}</Card>
      : null}</Transition>
    );
  }
}

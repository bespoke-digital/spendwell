
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
    onClose: PropTypes.func,
  }

  constructor() {
    super();
    this.state = { open: true };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'OVERLAY', open: true });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.overlayOpen && this.state.open)
      this.close();
  }

  close() {
    this.setState({ open: false });

    if (this.props.onClose)
      this.props.onClose();
  }

  render() {
    const { children } = this.props;
    const { open } = this.state;
    return (
      <Transition transitionName='modal'>{open ?
        <Card className={style.root}>{children}</Card>
      : null}</Transition>
    );
  }
}

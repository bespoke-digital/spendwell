
import { Component, PropTypes } from 'react';

import Card from 'components/card';
import SubtreeContainer from 'components/subtree-container';
import A from 'components/a';
import Icon from 'components/icon';

import style from 'sass/components/bottom-sheet';


export default class BottomSheet extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    visible: false,
    className: '',
  };

  state = {
    transitioned: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible)
      self.timeout = setTimeout(()=> {
        this.setState({ transitioned: nextProps.visible });
        self.timeout = null;
      }, nextProps.visible ? 100 : 300);
  }

  componentWillUnmount() {
    if (self.timeout)
      clearTimeout(self.timeout);
  }

  render() {
    const { onRequestClose, className, visible, children } = this.props;
    const { transitioned } = this.state;

    return (
      <SubtreeContainer stealScroll={visible}>
        <div onClick={onRequestClose} className={`
          bottom-sheet
          ${style.root}
          ${visible || transitioned ? 'in' : ''}
          ${visible && transitioned ? 'visible' : ''}
          ${className}
        `}>
          <Card onClick={(e)=> e.stopPropagation()}>
            <div className='bottom-sheet-actionbar'>
              <A onClick={onRequestClose}><Icon type='close' color='light'/></A>
            </div>
            <div className='bottom-sheet-children'>
              {children}
            </div>
          </Card>
        </div>
      </SubtreeContainer>
    );
  }
}

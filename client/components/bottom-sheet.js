
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

  render() {
    const { onRequestClose, className, visible, children } = this.props;

    return (
      <SubtreeContainer stealScroll={visible}>
        <div onClick={onRequestClose} className={`
          ${style.root}
          ${visible ? 'visible' : 'hidden'}
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

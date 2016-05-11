
import { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

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
    title: PropTypes.string,
    actions: PropTypes.object,
  };

  static defaultProps = {
    visible: false,
    className: '',
    title: '',
  };

  state = {
    transitioned: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      self.timeout = setTimeout(()=> {
        this.setState({ transitioned: nextProps.visible });
        self.timeout = null;
      }, nextProps.visible ? 100 : 300);
    }
  }

  componentDidUpdate(prevProps) {
    // This is seriously fucked. However, something about nodes being added
    // to children during the visibility toggle causes the scroll position
    // to get wonky without it.
    if (!prevProps.visible && this.props.visible) {
      setTimeout(()=> {
        const node = findDOMNode(this.refs.card);
        if (node)
          node.parentNode.scrollTop = 0;
      }, 1);
    }
  }

  componentWillUnmount() {
    if (self.timeout)
      clearTimeout(self.timeout);
  }

  render() {
    const {
      onRequestClose,
      className,
      visible,
      title,
      actions,
      children,
    } = this.props;

    const { transitioned } = this.state;

    if (!visible && !transitioned)
      return null;

    return (
      <SubtreeContainer
        stealScroll={visible}
        className={`
          ${style.root}
          ${visible && transitioned ? 'visible' : ''}
          ${className}
        `}
        onClick={onRequestClose}
      >
        <Card onClick={(e)=> e.stopPropagation()} ref='card'>
          <div className='bottom-sheet-actionbar'>
            <A className='close' onClick={onRequestClose}><Icon type='close' color='light'/></A>
            <div className='title'>{title}</div>
            <div className='bottom-sheet-actions'>{actions}</div>
          </div>
          <div className='bottom-sheet-children'>
            {children}
          </div>
        </Card>
      </SubtreeContainer>
    );
  }
}

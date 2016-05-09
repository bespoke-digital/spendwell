
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Modernizr from 'modernizr';

import Button from 'components/button';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import styles from 'sass/components/primary-fab.scss';


class PrimaryFab extends Component {
  static propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.object.isRequired,
      label: PropTypes.string,
      className: PropTypes.string,
    })).isRequired,
    chatlioOpen: PropTypes.bool.isRequired,
    icon: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProps = {
    icon: 'add',
    className: '',
  };

  state = {
    open: false,
  };

  handleOpen() {
    this.setState({ open: true });
  }

  render() {
    const { className, icon, actions, chatlioOpen } = this.props;
    const { open } = this.state;

    const defaultAction = _.find(actions, (a)=> a.default);
    const otherActions = _.filter(actions, (a)=> !a.default);

    return (
      <div
        onClickOff={()=> this.setState({ open: false })}
        className={`
          primary-fab
          ${styles.root}
          ${open ? 'primary-fab-open' : ''}
          ${chatlioOpen ? 'chatlio-open' : ''}
          ${className}
        `}
      >
        {defaultAction.label ?
          <Tooltip className='default'>{defaultAction.label}</Tooltip>
        : null}

        <Button
          onClick={Modernizr.touchevents && !open ? ::this.handleOpen : defaultAction.onClick}
          className={`primary ${defaultAction.className || ''}`}
          color='accent'
          fab
        >
          <Icon type={icon} color='light' className='initial'/>
          {defaultAction.icon}
        </Button>

        <div className='actions'>
          {otherActions.map(({ label, onClick, icon, className }, index)=>
            <div className={`action ${className || ''}`} key={index}>
              {label ? <Tooltip>{label}</Tooltip> : null}
              <Button onClick={onClick} color='primary' fab>{icon}</Button>
            </div>
          )}
        </div>

        {open ?
          <div className='overlay' onClick={()=> this.setState({ open: false })}/>
        : null}
      </div>
    );
  }
}


PrimaryFab = connect((state)=> ({
  chatlioOpen: state.chatlioOpen,
}))(PrimaryFab);

export default PrimaryFab;

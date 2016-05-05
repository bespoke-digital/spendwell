
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import styles from 'sass/components/primary-fab.scss';


export default class PrimaryFab extends Component {
  static propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.object.isRequired,
      label: PropTypes.string,
      className: PropTypes.string,
    })).isRequired,
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

  render() {
    const { className, icon, actions } = this.props;
    const { open } = this.state;

    const defaultAction = _.find(actions, 'default');
    const otherActions = _.filter(actions, (a)=> !a.default);

    return (
      <div className={`
        primary-fab
        ${styles.root}
        ${open ? 'primary-fab-open' : ''}
        ${className}
      `}>
        {defaultAction.label ?
          <Tooltip className='default-tooltip'>{defaultAction.label}</Tooltip>
        : null}
        <Button
          onClick={defaultAction.onClick}
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
      </div>
    );
  }
}

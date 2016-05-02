
import { Component, PropTypes } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import styles from 'sass/components/primary-fab.scss';


export default class PrimaryFab extends Component {
  static propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      color: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.string,
      iconColor: PropTypes.oneOf(['dark', 'light']),
    })).isRequired,
    icon: PropTypes.string,
    rotate: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    icon: 'add',
    rotate: true,
    className: '',
  };

  render() {
    const { className, rotate, icon, actions } = this.props;

    return (
      <div className={`
        primary-fab
        ${styles.root}
        ${rotate ? 'primary-fab-rotate' : ''}
        ${className ? className : ''}
      `}>
        <Button fab variant='accent' className='primary'>
          <Icon type={icon}/>
        </Button>

        <div className='actions'>
          {actions.map(({ label, onClick, icon, iconColor, color }, index)=>
            <div className='action' key={index}>
              {label ? <Tooltip>{label}</Tooltip> : null}
              <Button
                fab
                variant='primary'
                style={color ? { backgroundColor: color } : null}
                onClick={onClick}
              >
                <Icon
                  type={icon || 'add'}
                  color={iconColor ? iconColor : null}
                />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

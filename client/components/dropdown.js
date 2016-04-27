
import { Component, PropTypes } from 'react';

import ClickOff from 'components/click-off';
import Button from 'components/button';


export default class Dropdown extends Component {
  static propTypes = {
    label: PropTypes.any.isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
  };

  state = { open: false };

  render() {
    const { label, children, variant, disabled } = this.props;
    const { open } = this.state;

    return (
      <ClickOff
        className='mui-dropdown dropdown'
        onClickOff={()=> this.setState({ open: false })}
      >
        <Button
          onClick={this.setState.bind(this, { open: !open }, null)}
          variant={variant}
          disabled={disabled}
        >
          {label}
          <span className='mui-caret'/>
        </Button>
        <ul className={`mui-dropdown__menu ${open ? 'mui--is-open' : ''}`}>
          {children.map((child, index)=> (
            <li key={index} onClick={this.setState.bind(this, { open: false }, null)}>{child}</li>
          ))}
        </ul>
      </ClickOff>
    );
  }
}

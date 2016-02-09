
import { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import Button from 'components/button';


export default class Dropdown extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
  };

  constructor() {
    super();
    this.state = { open: false };
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, false);
  }

  handleDocumentClick(event) {
    if (this.state.open && !findDOMNode(this).contains(event.target))
      this.setState({ open: false });
  }

  render() {
    const { label, children, variant } = this.props;
    const { open } = this.state;

    return (
      <div className='mui-dropdown dropdown'>
        <Button onClick={this.setState.bind(this, { open: !open }, null)} variant={variant}>
          {label}
          <span className='mui-caret'/>
        </Button>
        <ul className={`mui-dropdown__menu ${open ? 'mui--is-open' : ''}`}>
          {children.map((child, index)=> (
            <li key={index} onClick={this.setState.bind(this, { open: false }, null)}>{child}</li>
          ))}
        </ul>
      </div>
    );
  }
}

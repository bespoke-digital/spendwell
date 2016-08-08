
import { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

export default class ClickOff extends Component {
  static propTypes = {
    onClickOff: PropTypes.func.isRequired,
  };

  constructor () {
    super()
    this.handleDocumentClick = ::this.handleDocumentClick
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false)
  }

  handleDocumentClick (event) {
    if (!findDOMNode(this).contains(event.target)) {
      this.props.onClickOff()
    }
  }

  render () {
    const { onClickOff, ..._props } = this.props
    return <div {..._props}/>
  }
}

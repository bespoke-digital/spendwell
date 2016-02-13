
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';


export default class ScrollTrigger extends Component {
  static propTypes = {
    onTrigger: PropTypes.func.isRequired,
    fromBottom: PropTypes.number,
  };

  static defaultProps = {
    fromBottom: 1000,
  };

  constructor() {
    super();
    this.handleScroll = _.debounce(::this.handleScroll, 100);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const { onTrigger, fromBottom } = this.props;
    const { bottom } = findDOMNode(this).getBoundingClientRect();

    if (bottom < fromBottom) onTrigger();
  }

  render() {
    const { onTrigger, fromBottom, ...props } = this.props;
    return <div {...props}/>;
  }
}

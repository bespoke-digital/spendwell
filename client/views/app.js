
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';
import { connect } from 'react-redux';

import Transition from 'components/transition';
import Header from 'components/header';
import Nav from 'components/nav';
import style from 'sass/views/app';


@connect((state)=> ({ overlayOpen: state.overlayOpen }))
@relayContainer({
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Header.getFragment('viewer')}
      }
    `,
  },
})
export default class App extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    overlayOpen: PropTypes.bool.isRequired,
    nav: PropTypes.object,
  }

  constructor() {
    super();
    this.state = { navOpen: false };
  }

  toggleNav() {
    const navOpen = !this.state.navOpen;
    this.setState({ navOpen });
    this.props.dispatch({ type: 'OVERLAY', open: navOpen });
  }

  closeOverlay() {
    if (this.state.navOpen)
      this.setState({ navOpen: false });
    this.props.dispatch({ type: 'OVERLAY', open: false });
  }

  render() {
    const { children, viewer, overlayOpen } = this.props;
    const { navOpen } = this.state;

    return (
      <div className={style.root}>
        <Header toggleNav={::this.toggleNav} viewer={viewer}/>

        <Nav open={navOpen} toggleNav={::this.toggleNav}/>

        <Transition transitionName='overlay'>
          {overlayOpen ?
            <div className='overlay' key='overlay' onClick={::this.closeOverlay}/>
          : null}
        </Transition>

        {children}
      </div>
    );
  }
}


import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { connect } from 'react-redux';

import Transition from 'components/transition';
import Header from 'components/header';
import Nav from 'components/nav';
import style from 'sass/components/app';


class App extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    overlayOpen: PropTypes.bool.isRequired,
    onOverlayClose: PropTypes.func,
    back: PropTypes.bool,
  };

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
    const { navOpen } = this.state;
    const { dispatch, onOverlayClose } = this.props;

    if (navOpen) this.setState({ navOpen: false });

    dispatch({ type: 'OVERLAY', open: false });

    if (onOverlayClose) onOverlayClose();
  }

  render() {
    const { children, viewer, overlayOpen, back } = this.props;
    const { navOpen } = this.state;

    console.log('app render overlayOpen', overlayOpen);
    return (
      <div className={style.root}>
        <Header toggleNav={::this.toggleNav} viewer={viewer} back={back}/>

        <Nav open={navOpen} toggleNav={::this.toggleNav}/>

        <Transition name='overlay' show={overlayOpen}>
          <div className='overlay' onClick={::this.closeOverlay}/>
        </Transition>

        {children}
      </div>
    );
  }
}

App = connect(function(state) {
  return { overlayOpen: state.overlayOpen };
})(App);

App = Relay.createContainer(App, {
  fragments: {
    viewer() {
      return Relay.QL`
        fragment on Viewer {
          ${Header.getFragment('viewer')}
        }
      `;
    },
  },
});

export default App;


import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Transition from 'components/transition';
import Header from 'components/header';
import Nav from 'components/nav';
import InstitutionReauth from 'components/institution-reauth';

import style from 'sass/components/app';


class App extends Component {
  static propTypes = {
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
  }

  closeOverlay() {
    const { onOverlayClose } = this.props;

    this.setState({ navOpen: false });

    if (onOverlayClose) onOverlayClose();
  }

  render() {
    const { children, viewer, back } = this.props;
    const { navOpen } = this.state;

    return (
      <div className={style.root}>
        <Header toggleNav={::this.toggleNav} viewer={viewer} back={back}/>

        <Nav open={navOpen} toggleNav={::this.toggleNav} viewer={viewer}/>

        <Transition show={navOpen}>
          <div className='overlay nav-overlay' onClick={::this.closeOverlay}/>
        </Transition>

        <div className='app-children'>
          <InstitutionReauth viewer={viewer}/>

          {children}
        </div>
      </div>
    );
  }
}

App = Relay.createContainer(App, {
  fragments: {
    viewer() {
      return Relay.QL`
        fragment on Viewer {
          ${Header.getFragment('viewer')}
          ${Nav.getFragment('viewer')}
          ${InstitutionReauth.getFragment('viewer')}
        }
      `;
    },
  },
});

export default App;

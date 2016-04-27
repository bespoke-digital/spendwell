
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { connect } from 'react-redux';

import Transition from 'components/transition';
import Header from 'components/header';
import Nav from 'components/nav';
import InstitutionReauth from 'components/institution-reauth';
import Progress from 'components/progress';

import style from 'sass/components/app';


class App extends Component {
  static propTypes = {
    loading: PropTypes.number.isRequired,
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
    const { children, viewer, back, loading } = this.props;
    const { navOpen } = this.state;

    return (
      <div className={style.root}>
        {loading ? <Progress className='global-loading' indeterminate/> : null}

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

App = connect((state)=> ({ loading: state.loading }))(App);

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

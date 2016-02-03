
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import Transition from 'components/transition';
import Header from 'components/header';
import Nav from 'components/nav';
import style from 'sass/views/app';


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
    nav: PropTypes.object,
  }

  constructor() {
    super();
    this.state = { navOpen: false };
  }

  toggleNav() {
    this.setState({ navOpen: !this.state.navOpen });
  }

  render() {
    const { children, viewer } = this.props;
    const { navOpen } = this.state;

    return (
      <div className={style.root}>
        <Header toggleNav={::this.toggleNav} viewer={viewer}/>

        <Nav open={navOpen} toggleNav={::this.toggleNav}/>

        <Transition transitionName='overlay'>
          {navOpen ?
            <div className='overlay' key='overlay' onClick={::this.toggleNav}/>
          : null}
        </Transition>

        {children}
      </div>
    );
  }
}

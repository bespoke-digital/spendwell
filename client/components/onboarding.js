
import { Component } from 'react';
import Relay from 'react-relay';

import Header from 'components/header';

import style from 'sass/components/app';


class Onboarding extends Component {
  render() {
    const { viewer, children } = this.props;
    return (
      <div className={`${style.root} onboarding`}>
        <Header viewer={viewer} plain/>
        <div className='app-children'>{children}</div>
      </div>
    );
  }
}

Onboarding = Relay.createContainer(Onboarding, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Header.getFragment('viewer')}
      }
    `,
  },
});

export default Onboarding;

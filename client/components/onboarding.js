
import { Component } from 'react';
import Relay from 'react-relay';

import OnboradingHeader from 'components/onboarding-header';

import style from 'sass/components/app';


class Onboarding extends Component {
  render() {
    const { viewer, children } = this.props;
    return (
      <div className={`${style.root} onboarding`}>
        <OnboradingHeader viewer={viewer} plain/>
        <div className='app-children'>{children}</div>
      </div>
    );
  }
}

Onboarding = Relay.createContainer(Onboarding, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        safeToSpend
      }
    `,
  },
});

export default Onboarding;

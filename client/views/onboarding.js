
import { Component } from 'react';
import Relay from 'react-relay';

import Header from 'components/header';

import style from 'sass/views/app';


class Onboarding extends Component {
  render() {
    const { viewer, children } = this.props;
    return (
      <div className={style.root}>
        <Header viewer={viewer} navHandle={false} showSafeToSpend={false}/>
        {children}
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
